using GiftDelivery.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin,SalesPerson,Supervisor")]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AnalyticsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var totalRevenue = await _context.GuestOrders.SumAsync(o => o.TotalAmount);
        var totalOrders = await _context.GuestOrders.CountAsync();
        var totalCustomers = await _context.Users.CountAsync();
        var lowStockItems = await _context.Products.CountAsync(p => p.StockQuantity <= 5);

        return Ok(new
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            TotalCustomers = totalCustomers,
            LowStockItems = lowStockItems
        });
    }

    [HttpGet("sales-stats")]
    public async Task<IActionResult> GetSalesStats()
    {
        // Group by product and sum quantity
        var salesByProduct = await _context.GuestOrders
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductName)
            .Select(g => new
            {
                ProductName = g.Key,
                TotalSales = g.Sum(i => i.Quantity),
                TotalRevenue = g.Sum(i => i.Subtotal)
            })
            .OrderByDescending(x => x.TotalSales)
            .ToListAsync();

        return Ok(salesByProduct);
    }

    [HttpGet("recent-activity")]
    public async Task<IActionResult> GetRecentActivity()
    {
        var recentOrders = await _context.GuestOrders
            .OrderByDescending(o => o.OrderDate)
            .Take(10)
            .Select(o => new
            {
                o.OrderNumber,
                o.RecipientName,
                o.TotalAmount,
                o.Status,
                o.OrderDate
            })
            .ToListAsync();

        return Ok(recentOrders);
    }
}
