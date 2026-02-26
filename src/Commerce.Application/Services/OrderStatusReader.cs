using Commerce.Application.Exceptions;
using Commerce.Application.Interfaces.In;
using Commerce.Application.Interfaces.Out;
using Commerce.Domain.Entities;

namespace Commerce.Application.Services;
public class OrderStatusReader : IOrderStatusReader
{
    private readonly IOrderRepository _orderRepo;
    public OrderStatusReader(IOrderRepository orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<OrderStatus> GetOrderStatus(Guid orderId, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(orderId, ct) ?? throw new NotFoundException($"Order {orderId} not found.");
        return order.Status;
    }
}