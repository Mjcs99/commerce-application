using System.Dynamic;

namespace Commerce.Domain.Entities;
public sealed class OrderItem
{
    public Guid Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public string? Name { get; private set; }
    public string? PrimaryImageUrl { get; private set; }

    private OrderItem() { }

    public OrderItem(Guid productId, string name, int quantity, decimal unitPrice, string primaryImageUrl)
    {
        ProductId = productId;
        Name = name;
        Quantity = quantity;
        UnitPrice = unitPrice;
        PrimaryImageUrl = primaryImageUrl;
    }
}