using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ImagesController> _logger;
    private static readonly string[] AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public ImagesController(IWebHostEnvironment env, ILogger<ImagesController> logger)
    {
        _env = env;
        _logger = logger;
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpPost("upload")]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { message = "File size exceeds 5 MB limit." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            return BadRequest(new { message = $"Invalid file type. Allowed: {string.Join(", ", AllowedExtensions)}" });

        // Ensure uploads directory exists
        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        Directory.CreateDirectory(uploadsDir);

        // Generate a unique filename to prevent collisions
        var uniqueName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, uniqueName);

        try
        {
            await using var stream = System.IO.File.Create(filePath);
            await file.CopyToAsync(stream);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save uploaded image.");
            return StatusCode(500, new { message = "Failed to save image." });
        }

        // Return the public URL for this image
        var imageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueName}";

        return Ok(new { url = imageUrl, filename = uniqueName });
    }

    [Authorize(Roles = "Admin,SuperAdmin")]
    [HttpDelete("{filename}")]
    public IActionResult Delete(string filename)
    {
        // Sanitize to prevent path traversal
        var safeName = Path.GetFileName(filename);
        var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
        var filePath = Path.Combine(uploadsDir, safeName);

        if (!System.IO.File.Exists(filePath))
            return NotFound(new { message = "File not found." });

        System.IO.File.Delete(filePath);
        return Ok(new { message = "Image deleted." });
    }
}
