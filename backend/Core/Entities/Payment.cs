namespace GiftDelivery.Api.Core.Entities;

public class Payment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty; // Stripe, Razorpay
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Completed, Failed
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;
}
