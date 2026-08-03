namespace GiftDelivery.Api.Core.Entities;

public class DeliverySlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int MaxDeliveries { get; set; }
    public bool IsActive { get; set; } = true;
}
