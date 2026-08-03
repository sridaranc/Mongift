namespace GiftDelivery.Api.Core.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
