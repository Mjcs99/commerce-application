using Commerce.Application.Orders.Commands;
using Commerce.Contracts.Orders;
using Commerce.Domain.Entities;
namespace Commerce.Application.Interfaces.In;

public interface IOrderService
{
    Task<Guid> CreateOrderAsync(PlaceOrderRequest request, Guid customerId, CancellationToken ct);
    Task<GetOrdersResponse> GetOrdersAsync(Guid customerId, CancellationToken ct);
    Task<OrderDTO> GetOrderAsync(Guid orderId, CancellationToken ct);
}