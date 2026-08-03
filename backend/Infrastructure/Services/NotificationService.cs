using GiftDelivery.Api.Core.Entities;
using GiftDelivery.Api.Infrastructure.Data;
using GiftDelivery.Api.Hubs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using GiftDelivery.Api.Infrastructure.Messaging;

namespace GiftDelivery.Api.Infrastructure.Services;

public interface INotificationService
{
    Task NotifyOrderStatusChanged(GuestOrder order, string? customMessage = null);
    Task NotifyLowStock(Product product);
}

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;

    public NotificationService(
        ApplicationDbContext context, 
        UserManager<ApplicationUser> userManager, 
        IHubContext<NotificationHub> hubContext,
        IEmailService emailService,
        ISmsService smsService)
    {
        _context = context;
        _userManager = userManager;
        _hubContext = hubContext;
        _emailService = emailService;
        _smsService = smsService;
    }

    public async Task NotifyOrderStatusChanged(GuestOrder order, string? customMessage = null)
    {
        string title = "Order Update";
        string statusMessage = customMessage ?? $"Order {order.OrderNumber} is now {order.Status}.";
        
        if (order.Status == "Pending" && string.IsNullOrEmpty(customMessage))
        {
            title = "Order Received";
            statusMessage = $"Thank you! Your order {order.OrderNumber} has been received and is being processed.";
        }

        // 1. Notify the Customer (Email + SMS + In-App)
        await CreateInAppNotification(order.CustomerId, title, statusMessage, $"/track/{order.OrderNumber}");
        await _emailService.SendEmailAsync(order.RecipientEmail, title, statusMessage);
        await _smsService.SendSmsAsync(order.RecipientPhone, statusMessage);

        // 2. Notify Assigned Staff (if any)
        if (order.AssignedStaffId.HasValue)
        {
            var assignedStaff = await _userManager.FindByIdAsync(order.AssignedStaffId.Value.ToString());
            if (assignedStaff != null)
            {
                string staffTitle = "Assignment Update: Order " + order.OrderNumber;
                string staffMsg = $"You have an update on order {order.OrderNumber}. New Status: {order.Status}. " + (customMessage ?? "");
                await CreateInAppNotification(assignedStaff.Id, staffTitle, staffMsg, "/admin/orders");
                if (!string.IsNullOrEmpty(assignedStaff.Email)) await _emailService.SendEmailAsync(assignedStaff.Email, staffTitle, staffMsg);
                if (!string.IsNullOrEmpty(assignedStaff.PhoneNumber)) await _smsService.SendSmsAsync(assignedStaff.PhoneNumber, staffMsg);
            }
        }

        // 3. Notify Staff Roles (Admins, Sales, etc. - general broadcast)
        var staffRoles = new[] { "Admin", "SuperAdmin", "SalesPerson" };
        var staffUsers = await _userManager.Users
            .Where(u => u.IsActive)
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u, ur })
            .Join(_context.Roles, combined => combined.ur.RoleId, r => r.Id, (combined, r) => new { combined.u, r })
            .Where(x => staffRoles.Contains(x.r.Name))
            .Select(x => x.u)
            .Distinct()
            .ToListAsync();

        foreach (var user in staffUsers)
        {
            string adminTitle = $"Staff Alert: {title}";
            string adminMessage = $"Order {order.OrderNumber} status: {order.Status}. " + (customMessage ?? "");
            await CreateInAppNotification(user.Id, adminTitle, adminMessage, "/admin/orders");
            
            // For general broadcast to admins, maybe just In-App and Email
            if (!string.IsNullOrEmpty(user.Email))
                await _emailService.SendEmailAsync(user.Email, adminTitle, adminMessage);
        }
    }

    public async Task NotifyLowStock(Product product)
    {
        string title = "Inventory Alert: Low Stock";
        string message = $"Product '{product.Name}' has reached low stock ({product.StockQuantity} remaining).";

        var targetRoles = new[] { "Admin", "SuperAdmin", "Supervisor" };
        var targets = await _userManager.Users
            .Where(u => u.IsActive)
            .Join(_context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u, ur })
            .Join(_context.Roles, combined => combined.ur.RoleId, r => r.Id, (combined, r) => new { combined.u, r })
            .Where(x => targetRoles.Contains(x.r.Name))
            .Select(x => x.u)
            .Distinct()
            .ToListAsync();

        foreach (var user in targets)
        {
            await CreateInAppNotification(user.Id, title, message, "/admin/products");
            if (!string.IsNullOrEmpty(user.Email))
                await _emailService.SendEmailAsync(user.Email, title, message);
        }
    }

    private async Task CreateInAppNotification(Guid? userId, string title, string message, string? link = null)
    {
        if (!userId.HasValue) return;

        var notification = new Notification
        {
            UserId = userId.Value,
            Title = title,
            Message = message,
            Link = link,
            CreatedAt = DateTime.UtcNow
        };
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.User(userId.Value.ToString()).SendAsync("ReceiveNotification", new 
        {
            title,
            message,
            link,
            createdAt = notification.CreatedAt
        });
    }
}
