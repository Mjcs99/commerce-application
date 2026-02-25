using Commerce.Domain.Entities;

namespace Commerce.Application.Interfaces.In;

public interface IOrderStatusReader
{
    public Task<OrderStatus> GetOrderStatus(Guid orderId, CancellationToken ct);
}