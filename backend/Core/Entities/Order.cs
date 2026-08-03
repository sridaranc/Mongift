namespace GiftDelivery.Api.Core.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending"; // Pending, Paid, Processing, OutForDelivery, Delivered, Cancelled
    public decimal TotalAmount { get; set; }
    public string SpecialInstructions { get; set; } = string.Empty;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public Guid AddressId { get; set; }
    public Address Address { get; set; } = null!;

    public Guid DeliverySlotId { get; set; }
    public DeliverySlot DeliverySlot { get; set; } = null!;

    public Guid? AssignedDeliveryPersonId { get; set; }
    public ApplicationUser? AssignedDeliveryPerson { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<OrderHistory> History { get; set; } = new List<OrderHistory>();
    public Payment? Payment { get; set; }
}
