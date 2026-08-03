using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GiftDelivery.Api.Infrastructure.Data;
using GiftDelivery.Api.Core.Entities;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .AsNoTracking()
            .ToListAsync();

        return Ok(categories);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost]
    public async Task<IActionResult> CreateCategory([FromBody] CategoryRequest req)
    {
        var category = new Category
        {
            Name = req.Name,
            Description = req.Description ?? "",
            ImageUrl = req.ImageUrl ?? "",
            IsActive = true
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return Ok(category);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategoryRequest req)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Category not found." });

        category.Name = req.Name;
        category.Description = req.Description ?? category.Description;
        if (!string.IsNullOrEmpty(req.ImageUrl))
            category.ImageUrl = req.ImageUrl;

        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Category not found." });

        // Soft-delete
        category.IsActive = false;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Category deleted successfully." });
    }

    public record CategoryRequest(string Name, string? Description, string? ImageUrl);
}
