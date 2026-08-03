using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using GiftDelivery.Api.Infrastructure.Messaging;

namespace GiftDelivery.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OtpController : ControllerBase
{
    public static readonly ConcurrentDictionary<string, (string Otp, DateTime Expiry)> OtpStore = new();
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;

    public OtpController(IEmailService emailService, ISmsService smsService)
    {
        _emailService = emailService;
        _smsService = smsService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Target))
            return BadRequest(new { message = "Email or Phone is required." });

        // Generate a 6-digit OTP
        var otp = new Random().Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(5);

        OtpStore[req.Target] = (otp, expiry);

        try
        {
            if (req.Target.Contains("@"))
            {
                await _emailService.SendEmailAsync(req.Target, "Mon Gift - Verification Code", $"Your security code is: <b>{otp}</b>. It will expire in 5 minutes.");
            }
            else
            {
                await _smsService.SendSmsAsync(req.Target, $"Mon Gift: Your security code is {otp}. Valid for 5 mins.");
            }
            return Ok(new { message = "OTP sent successfully." });
        }
        catch (Exception ex)
        {
            // Log the error but return a 400 with the specific provider error to the user
            Console.WriteLine($"[OTP CONTROLLER ERROR] {ex.Message}");
            return BadRequest(new { message = $"Failed to send code: {ex.Message}" });
        }
    }

    [HttpPost("verify")]
    public IActionResult VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        if (!OtpStore.TryGetValue(req.Target, out var stored) || stored.Expiry < DateTime.UtcNow)
        {
            return BadRequest(new { message = "OTP expired or not found. Please resend." });
        }

        if (stored.Otp != req.Code)
        {
            return BadRequest(new { message = "Invalid OTP code." });
        }

        // OTP verified, remove it
        OtpStore.TryRemove(req.Target, out _);

        return Ok(new { message = "Verified successfully." });
    }

    public record SendOtpRequest(string Target);
    public record VerifyOtpRequest(string Target, string Code);
}
