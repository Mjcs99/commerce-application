using Commerce.Domain.Entities;

namespace Commerce.Application.Interfaces.Out;
public interface IOrderRepository
{
    public void AddOrder(Order order);
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default);
    public Task<IReadOnlyList<Order>> GetOrders(Guid customerId, CancellationToken ct = default);
}