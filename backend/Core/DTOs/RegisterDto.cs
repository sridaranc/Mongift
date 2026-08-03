namespace GiftDelivery.Api.Core.DTOs;

public record RegisterDto(
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    string Address,
    string? OtpCode = null,
    string? Password = null
);
