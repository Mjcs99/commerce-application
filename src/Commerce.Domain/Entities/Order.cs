namespace Commerce.Domain.Entities;
public enum OrderStatus
{
    Pending,
    Processed,
    Shipped,
    Delivered,
    Cancelled
}
public sealed class Order
{
    public Guid Id { get; private set; }
    public Guid CustomerId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public DateTime CreatedAtUtc { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items;
    private Order() { }

    public Order(Guid id, Guid customerId, DateTime createdAtUtc)
    {
        Id = id;
        CustomerId = customerId;
        CreatedAtUtc = createdAtUtc;
    }

    public static Order Create(Guid customerId)
        => new(Guid.NewGuid(), customerId, DateTime.UtcNow);
    public void AddItem(Guid productId, string name, int quanitity, decimal unitPrice, string primaryImageUrl)
    {
        _items.Add(new OrderItem(
            productId,
            name,
            quanitity,
            unitPrice,
            primaryImageUrl
        ));
    }
    
    public void UpdateStatus()
    {
        if(Status is OrderStatus.Cancelled) throw new InvalidOperationException("Cancelled orders cannot update.");
        if(Status is OrderStatus.Delivered) throw new InvalidOperationException("Delivered orders cannot update.");
        
        Status = Status switch
        {
            OrderStatus.Pending => OrderStatus.Processed,
            OrderStatus.Processed => OrderStatus.Shipped,
            OrderStatus.Shipped => OrderStatus.Delivered,
            _ => throw new InvalidOperationException($"Cannot update from status {Status}.")
        };
    }
}