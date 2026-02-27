namespace Commerce.Domain.Entities;
public class InventoryItem
{
    public Guid ProductId { get; set; }
    
    public int QuantityAvailable { get; set; }

    public void Reserve(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));

        if (QuantityAvailable < quantity)
            throw new InvalidOperationException("Insufficient stock.");

        QuantityAvailable -= quantity;
    }

    public void Unreserve(int quantity)
    {
        if (quantity <= 0)
            throw new ArgumentOutOfRangeException(nameof(quantity));
        QuantityAvailable += quantity;
    }
}