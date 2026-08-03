namespace GiftDelivery.Api.Core.Entities;

public class Address
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public bool IsDefault { get; set; }

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;
}
