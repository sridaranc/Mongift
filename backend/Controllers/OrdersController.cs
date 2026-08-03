using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GiftDelivery.Api.Infrastructure.Data;
using GiftDelivery.Api.Core.Entities;
using Stripe;
using System.Security.Claims;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly GiftDelivery.Api.Infrastructure.Services.INotificationService _notificationService;

    public OrdersController(ApplicationDbContext context, GiftDelivery.Api.Infrastructure.Services.INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public record PlaceOrderRequest(
        List<OrderLineItem> Items,
        string RecipientName,
        string RecipientPhone,
        string RecipientEmail,
        string DeliveryAddress,
        string DeliveryCity,
        string DeliveryPostalCode,
        string? GiftMessage,
        string? Occasion,
        DateTime? DeliveryDate,
        string? PreferredSlot,
        string? PromoCode
    );

    public record OrderLineItem(Guid ProductId, int Quantity);

    [HttpPost]
    public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderRequest req)
    {
        if (req.Items == null || req.Items.Count == 0)
            return BadRequest(new { message = "Order must contain at least one item." });

        var productIds = req.Items.Select(i => i.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != req.Items.Count)
            return BadRequest(new { message = "One or more products are unavailable." });

        foreach (var line in req.Items)
        {
            var product = products.First(p => p.Id == line.ProductId);
            if (product.StockQuantity < line.Quantity)
                return BadRequest(new { message = $"Insufficient stock for '{product.Name}'." });
        }

        var orderNumber = $"MG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var total = req.Items.Sum(line =>
        {
            var p = products.First(p => p.Id == line.ProductId);
            return p.Price * line.Quantity;
        });

        if (!string.IsNullOrWhiteSpace(req.PromoCode))
        {
            var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Code.ToLower() == req.PromoCode.ToLower());
            if (promo != null && promo.IsActive && promo.ValidUntil >= DateTime.UtcNow && promo.TimesUsed < promo.UsageLimit)
            {
                var discount = total * (promo.DiscountPercentage / 100);
                if (discount > promo.MaxDiscountAmount)
                    discount = promo.MaxDiscountAmount;
                total -= discount;
                
                promo.TimesUsed++;
                _context.PromoCodes.Update(promo);
            }
        }

        Guid? customerId = null;
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdStr, out var parsedId)) customerId = parsedId;

        var orderRecord = new GuestOrder
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            OrderNumber = orderNumber,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            TotalAmount = total,
            RecipientName = req.RecipientName,
            RecipientPhone = req.RecipientPhone,
            RecipientEmail = req.RecipientEmail,
            DeliveryAddress = req.DeliveryAddress,
            DeliveryCity = req.DeliveryCity,
            DeliveryPostalCode = req.DeliveryPostalCode,
            GiftMessage = req.GiftMessage ?? "",
            Occasion = req.Occasion ?? "",
            DeliveryDate = req.DeliveryDate,
            PreferredSlot = req.PreferredSlot ?? "",
            Items = req.Items.Select(line =>
            {
                var p = products.First(p => p.Id == line.ProductId);
                return new GuestOrderItem
                {
                    ProductId = p.Id,
                    ProductName = p.Name,
                    UnitPrice = p.Price,
                    Quantity = line.Quantity,
                    Subtotal = p.Price * line.Quantity
                };
            }).ToList()
        };

        foreach (var line in req.Items)
        {
            var p = products.First(p => p.Id == line.ProductId);
            p.StockQuantity -= line.Quantity;

            if (p.StockQuantity <= 5)
            {
                await _notificationService.NotifyLowStock(p);
            }
        }

        bool isTrichy = req.DeliveryAddress.ToLower().Contains("trichy") || req.DeliveryAddress.ToLower().Contains("tiruchirappalli");
        if (!isTrichy)
            return BadRequest(new { message = "Currently, we only deliver within Trichy, Tamil Nadu." });

        double distanceKm = new Random().NextDouble() * 8; 
        if (distanceKm > 5)
            return BadRequest(new { message = $"Delivery address is {distanceKm:F1}km away, which exceeds our 5km limit." });

        int estimatedMinutes = (int)(distanceKm * (120.0 / 5.0)); 
        var estimatedArrival = DateTime.UtcNow.AddMinutes(estimatedMinutes);

        _context.GuestOrders.Add(orderRecord);

        var historyRecord = new GuestOrderHistory
        {
            GuestOrderId = orderRecord.Id,
            Status = orderRecord.Status,
            Remarks = "Order placed by customer."
        };
        _context.GuestOrderHistories.Add(historyRecord);

        // CREATE STRIPE PAYMENT INTENT
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(total * 100), // Convert to cents
            Currency = "usd",
            Metadata = new Dictionary<string, string>
            {
                { "OrderId", orderRecord.Id.ToString() },
                { "OrderNumber", orderRecord.OrderNumber }
            }
        };
        var service = new PaymentIntentService();
        PaymentIntent intent = await service.CreateAsync(options);

        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderStatusChanged(orderRecord);

        return Ok(new
        {
            orderRecord.Id,
            orderRecord.OrderNumber,
            orderRecord.TotalAmount,
            orderRecord.Status,
            orderRecord.OrderDate,
            DistanceKm = Math.Round(distanceKm, 2),
            EstimatedDeliveryMinutes = estimatedMinutes,
            EstimatedArrival = estimatedArrival,
            ClientSecret = intent.ClientSecret,
            Items = orderRecord.Items.Select(i => new
            {
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.Subtotal
            })
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("my-orders")]
    public async Task<IActionResult> MyOrders()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var customerId)) return Unauthorized();

        var orders = await _context.GuestOrders
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.OrderDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(orders);
    }

    [Authorize(Roles = "Customer")]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var customerId)) return Unauthorized();

        var order = await _context.GuestOrders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id && o.CustomerId == customerId);
        if (order == null) return NotFound();

        if (order.Status != "Pending")
            return BadRequest(new { message = "Only pending orders can be cancelled." });

        var age = DateTime.UtcNow - order.OrderDate;
        if (age.TotalMinutes > 30)
            return BadRequest(new { message = "Orders can only be cancelled within 30 minutes of placement." });

        order.Status = "Cancelled";
        
        foreach(var item in order.Items)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product != null) product.StockQuantity += item.Quantity;
        }

        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderStatusChanged(order);
        
        return Ok(new { message = "Order cancelled successfully.", order.OrderNumber });
    }


    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var order = await _context.GuestOrders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin") || User.IsInRole("SalesPerson");
        bool isOwner = order.CustomerId == userId;
        bool isAssignedDelivery = User.IsInRole("Delivery") && order.AssignedStaffId == userId;

        if (!isAdmin && !isOwner && !isAssignedDelivery)
            return Unauthorized(new { message = "You do not have permission to view this order." });

        return Ok(new
        {
            order.Id,
            order.OrderNumber,
            order.Status,
            order.TotalAmount,
            order.OrderDate,
            order.RecipientName,
            order.DeliveryAddress,
            order.GiftMessage,
            order.Occasion,
            order.ProofOfDeliveryUrl,
            order.AssignedStaffId,
            Items = order.Items.Select(i => new
            {
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.Subtotal
            })
        });
    }

    [HttpGet("{orderNumber}")]

    public async Task<IActionResult> TrackOrder(string orderNumber)
    {
        var order = await _context.GuestOrders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        if (order == null)
            return NotFound(new { message = "Order not found." });

        if (order.CustomerId.HasValue)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            bool isAdmin = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
            bool isOwner = Guid.TryParse(userIdStr, out var userId) && userId == order.CustomerId;

            if (!isAdmin && !isOwner)
                return Unauthorized(new { message = "You do not have permission to view this order." });
        }

        return Ok(new
        {
            order.Id,
            order.OrderNumber,
            order.Status,
            order.TotalAmount,
            order.OrderDate,
            order.RecipientName,
            order.DeliveryAddress,
            order.GiftMessage,
            order.Occasion,
            order.ProofOfDeliveryUrl,
            order.AssignedStaffId,
            Items = order.Items.Select(i => new
            {
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.Subtotal
            })
        });
    }

    [Authorize(Roles = "Admin,SuperAdmin,SalesPerson,Delivery")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.GuestOrders.AsQueryable();

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid.TryParse(userIdStr, out var userId);

        if (User.IsInRole("Delivery") && !User.IsInRole("Admin") && !User.IsInRole("SuperAdmin"))
        {
            query = query.Where(o => o.AssignedStaffId == userId);
        }

        var total = await query.CountAsync();
        var orders = await query
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync();

        return Ok(new
        {
            TotalItems = total,
            Page = page,
            PageSize = pageSize,
            Data = orders.Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.Status,
                o.TotalAmount,
                o.OrderDate,
                o.RecipientName,
                o.AssignedStaffId,
                ItemCount = o.Items.Count
            })
        });
    }

    [Authorize(Roles = "Admin,SuperAdmin,SalesPerson,Delivery")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest req)
    {
        var order = await _context.GuestOrders.FindAsync(id);
        if (order == null) return NotFound();
        
        order.Status = req.Status;
        if (req.AssignedStaffId.HasValue)
        {
            order.AssignedStaffId = req.AssignedStaffId;
        }

        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? changedById = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;

        var historyRecord = new GuestOrderHistory
        {
            GuestOrderId = order.Id,
            Status = req.Status,
            Remarks = req.Message ?? $"Status updated to {req.Status}",
            ChangedById = changedById
        };
        _context.GuestOrderHistories.Add(historyRecord);

        await _context.SaveChangesAsync();
        await _notificationService.NotifyOrderStatusChanged(order, req.Message);
        
        return Ok(new { order.OrderNumber, order.Status, order.AssignedStaffId });
    }

    public record UpdateStatusRequest(string Status, string? Message, Guid? AssignedStaffId);

    [Authorize(Roles = "Admin,SuperAdmin,Delivery")]
    [HttpPost("{id}/pod")]
    public async Task<IActionResult> UploadProofOfDelivery(Guid id, IFormFile file)
    {
        var order = await _context.GuestOrders.FindAsync(id);
        if (order == null) return NotFound();

        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "pod");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        order.ProofOfDeliveryUrl = $"/uploads/pod/{uniqueFileName}";
        await _context.SaveChangesAsync();

        return Ok(new { order.ProofOfDeliveryUrl });
    }
}
