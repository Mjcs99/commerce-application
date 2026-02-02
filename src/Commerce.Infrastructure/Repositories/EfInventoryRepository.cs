using Microsoft.EntityFrameworkCore;
using Commerce.Application.Interfaces.Out;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;

public sealed class EfInventoryRepository : IInventoryRepository
{
    private readonly CommerceDbContext _db;

    public EfInventoryRepository(CommerceDbContext db)
    {
        _db = db;
    }

    public async Task ReserveAsync(Guid productId, int quantity, CancellationToken ct)
    {
        var inventory = await _db.InventoryItems
            .SingleOrDefaultAsync(i => i.ProductId == productId, ct) ?? throw new InvalidOperationException($"Inventory not found for product {productId}");
        inventory.Reserve(quantity);
    }

    public async Task UnreserveAsync(Guid productId, int quantity, CancellationToken ct)
    {
        var inventory = await _db.InventoryItems
            .SingleOrDefaultAsync(i => i.ProductId == productId, ct) ?? throw new InvalidOperationException($"Inventory not found for product {productId}");
        inventory.Unreserve(quantity);
    }

}
