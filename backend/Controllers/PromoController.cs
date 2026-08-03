using GiftDelivery.Api.Core.Entities;
using GiftDelivery.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromoController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PromoController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("{code}/validate")]
    public async Task<IActionResult> ValidatePromoCode(string code)
    {
        var promo = await _context.PromoCodes.FirstOrDefaultAsync(p => p.Code.ToLower() == code.ToLower());
        if (promo == null) return NotFound(new { message = "Invalid promo code." });

        if (!promo.IsActive || promo.ValidUntil < DateTime.UtcNow)
            return BadRequest(new { message = "Promo code is expired or inactive." });

        if (promo.TimesUsed >= promo.UsageLimit)
            return BadRequest(new { message = "Promo code usage limit reached." });

        return Ok(promo);
    }

    [Authorize(Roles = "Admin,SuperAdmin,SalesPerson")]
    [HttpPost]
    public async Task<IActionResult> CreatePromoCode([FromBody] PromoCode dto)
    {
        if (await _context.PromoCodes.AnyAsync(p => p.Code.ToLower() == dto.Code.ToLower()))
            return BadRequest(new { message = "Promo code already exists." });

        _context.PromoCodes.Add(dto);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Promo code created successfully.", promo = dto });
    }

    [Authorize(Roles = "Admin,SuperAdmin,SalesPerson")]
    [HttpGet]
    public async Task<IActionResult> GetAllPromos()
    {
        var promos = await _context.PromoCodes.OrderByDescending(p => p.ValidUntil).ToListAsync();
        return Ok(promos);
    }
}
