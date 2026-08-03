namespace GiftDelivery.Api.Core.Entities;

public class OrderHistory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Status { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}
