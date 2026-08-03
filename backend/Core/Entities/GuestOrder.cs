namespace GiftDelivery.Api.Core.Entities;

public class GuestOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? CustomerId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }

    public string RecipientName { get; set; } = string.Empty;
    public string RecipientPhone { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string DeliveryAddress { get; set; } = string.Empty;
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public string GiftMessage { get; set; } = string.Empty;
    public string Occasion { get; set; } = string.Empty;
    public DateTime? DeliveryDate { get; set; }
    public string PreferredSlot { get; set; } = string.Empty; // e.g. "9AM-12PM", "2PM-5PM"

    public List<GuestOrderItem> Items { get; set; } = new();

    public Guid? AssignedStaffId { get; set; }
    public ApplicationUser? AssignedStaff { get; set; }
    
    public string? ProofOfDeliveryUrl { get; set; }
}

public class GuestOrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GuestOrderId { get; set; }
    public GuestOrder GuestOrder { get; set; } = null!;

    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
