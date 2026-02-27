using Commerce.Domain.Entities;

namespace Commerce.Application.Interfaces.Out;
public interface IOrderRepository
{
    void AddOrder(Order order);
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IReadOnlyList<Order>> GetOrders(Guid customerId, CancellationToken ct = default);
    Task RemoveOrder(Guid id);
    Task DeleteFailedOrdersAsync(CancellationToken ct);
}