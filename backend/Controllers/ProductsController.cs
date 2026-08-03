using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GiftDelivery.Api.Infrastructure.Data;
using GiftDelivery.Api.Core.Entities;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsNoTracking();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.ToLower().Contains(search.ToLower()) ||
                                     p.Description.ToLower().Contains(search.ToLower()));

        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var totalItems = await query.CountAsync();
        var products = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                p.Price,
                p.StockQuantity,
                p.ImageUrl,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : "Unknown"
            })
            .ToListAsync();

        return Ok(new
        {
            TotalItems = totalItems,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize),
            Data = products
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (product == null)
            return NotFound(new { message = "Product not found" });

        return Ok(new
        {
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.StockQuantity,
            product.ImageUrl,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? "Unknown"
        });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequest req)
    {
        var product = new Product
        {
            Name = req.Name,
            Description = req.Description ?? "",
            Price = req.Price,
            StockQuantity = req.StockQuantity,
            ImageUrl = req.ImageUrl ?? "",
            CategoryId = req.CategoryId,
            IsActive = true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(new { product.Id, product.Name, product.Price, product.StockQuantity, product.ImageUrl, product.CategoryId });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductRequest req)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.Name = req.Name;
        product.Description = req.Description ?? product.Description;
        product.Price = req.Price;
        product.StockQuantity = req.StockQuantity;
        if (!string.IsNullOrEmpty(req.ImageUrl))
            product.ImageUrl = req.ImageUrl;
        product.CategoryId = req.CategoryId;

        await _context.SaveChangesAsync();
        return Ok(new { product.Id, product.Name, product.Price, product.StockQuantity, product.ImageUrl, product.CategoryId });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound();

        product.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Product deleted successfully." });
    }
}

public record ProductRequest(string Name, string? Description, decimal Price, int StockQuantity, string? ImageUrl, Guid CategoryId);
