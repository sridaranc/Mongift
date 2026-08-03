namespace GiftDelivery.Api.Core.Entities;

public class GuestOrderHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestOrderId { get; set; }
    public GuestOrder GuestOrder { get; set; } = null!;
    
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Optional: Who made the change (Admin/Staff ID)
    public Guid? ChangedById { get; set; }
    public ApplicationUser? ChangedBy { get; set; }
}
