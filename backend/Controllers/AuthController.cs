using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using GiftDelivery.Api.Core.DTOs;
using GiftDelivery.Api.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
        if (!isPasswordValid)
            return Unauthorized(new { message = "Invalid email or password" });

        var roles = await _userManager.GetRolesAsync(user);

        var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
        };

        foreach (var role in roles)
        {
            authClaims.Add(new Claim(ClaimTypes.Role, role));
        }

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            expires: DateTime.Now.AddMinutes(jwtSettings.GetValue<int>("ExpirationInMinutes")),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );

        // Role management is handled by the database

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token),
            expiration = token.ValidTo,
            user = new 
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                Roles = roles
            }
        });
    }
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        // 1. Verify OTP if no password provided (Web Flow)
        if (string.IsNullOrEmpty(dto.Password))
        {
            if (string.IsNullOrEmpty(dto.OtpCode) || !OtpController.OtpStore.TryGetValue(dto.Email, out var stored) || stored.Otp != dto.OtpCode || stored.Expiry < DateTime.UtcNow)
            {
                return BadRequest(new { message = "Invalid or expired OTP." });
            }
            OtpController.OtpStore.TryRemove(dto.Email, out _);
        }

        // 2. Check if user exists
        if (await _userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest(new { message = "User already exists with this email." });

        // 3. Create User
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            FullAddress = dto.Address,
            PhoneNumber = dto.PhoneNumber,
            EmailConfirmed = true,
            PhoneNumberConfirmed = true
        };

        // 4. Set Password (Provided or Random)
        var password = dto.Password ?? GenerateRandomPassword();
        var result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
            return BadRequest(new { message = "Registration failed.", errors = result.Errors });

        // 5. Add to Customer Role
        await _userManager.AddToRoleAsync(user, "Customer");

        // 6. "Send" Email with credentials
        Console.WriteLine($"[EMAIL MOCK] Sending credentials to {dto.Email}");
        Console.WriteLine($"Welcome to Mon Gift! Your login password is: {password}");

        return Ok(new { message = "Registration successful. Credentials sent to your email." });
    }

    private string GenerateRandomPassword()
    {
        var opts = _userManager.Options.Password;
        string chars = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@$?_-";
        Random rand = new Random();
        return new string(Enumerable.Repeat(chars, 12).Select(s => s[rand.Next(s.Length)]).ToArray());
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
            // Don't reveal that the user does not exist or is not confirmed
            return Ok(new { message = "If your email is registered, you will receive a new password shortly." });
        }

        var newPassword = GenerateRandomPassword();
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetResult = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

        if (!resetResult.Succeeded)
        {
            return BadRequest(new { message = "Failed to reset password." });
        }

        // Send Email (Mock)
        Console.WriteLine($"[EMAIL MOCK] Password reset for {dto.Email}");
        Console.WriteLine($"Your new password is: {newPassword}");

        return Ok(new { message = "If your email is registered, you will receive a new password shortly." });
    }
}

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
}
