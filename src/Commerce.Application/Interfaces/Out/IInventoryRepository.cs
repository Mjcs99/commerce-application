using Commerce.Domain.Entities;
namespace Commerce.Application.Interfaces.Out;
public interface IInventoryRepository
{
    Task ReserveAsync(Guid productId, int quantity, CancellationToken ct);
    Task UnreserveAsync(Guid productId, int quantity, CancellationToken ct);
}