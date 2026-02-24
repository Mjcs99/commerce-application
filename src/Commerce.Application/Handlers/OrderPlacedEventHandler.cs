using System.Text.Json;
using Commerce.Application.Exceptions;
using Commerce.Application.Interfaces.In;
using Commerce.Application.Interfaces.Out;
using Commerce.Contracts.IntegrationContracts.Orders;
using Microsoft.Extensions.Logging;

namespace Commerce.Application.Services;

public class OrderPlacedEventHandler : IIntegrationEventHandler
{
    private readonly IOrderRepository _orderRepo;
    private readonly IInventoryRepository _inventoryRepo;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IOutbox _outbox;
    private readonly IHubPublisher _publisher;
    private readonly ILogger<OrderPlacedEventHandler> _logger;
    public OrderPlacedEventHandler(IOrderRepository orderRepo, IInventoryRepository inventoryRepo, IOutbox outbox, IUnitOfWork unitOfWork, IHubPublisher publisher, ILogger<OrderPlacedEventHandler> logger)
    {
        _orderRepo = orderRepo;
        _inventoryRepo = inventoryRepo;
        _unitOfWork = unitOfWork;
        _outbox = outbox;
        _publisher = publisher;
        _logger = logger;
    }

    public bool CanHandle(string type)
    {
        return true && type == "OrderPlaced";
    }

    public async Task HandleAsync(string type, string payload, CancellationToken ct)
    {
        var evt = JsonSerializer.Deserialize<OrderPlacedEvent>(
            payload,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        );

        if (evt == null) return;
        
        var order = await _orderRepo.GetByIdAsync(evt.OrderId, ct) 
            ?? throw new NotFoundException("Order does not exist");
            
        order.UpdateStatus();

        IEnumerable<OrderPlacedItem> items = evt.Items;
        List<(Guid, int)> reserved = new();
     
        foreach (var item in items) {
            try
            {
                var id = item.ProductId;
                var quantity = item.Qauntity;
                await _inventoryRepo.ReserveAsync(item.ProductId, item.Qauntity, ct);
                reserved.Add((id, quantity));
            }
            catch(Exception reserveEx)
            {
                foreach (var (id, quantity) in reserved)
                {
                    try
                    {
                        await _inventoryRepo.UnreserveAsync(id, quantity, ct);
                    }
                    catch(Exception rollbackEx)
                    {
                        _logger.LogCritical(rollbackEx, "Failed to rollback reservation for ProductId={ProductId}", id);
                    }
                }
                _logger.LogError(reserveEx, "Unable to reserve stock for ProductId={ProductId}", item.ProductId);
                await _orderRepo.RemoveOrder(order.Id);
                await _publisher.PublishOrderFailedAsync(evt.OrderId, "OutOfStock", ct);
                await _unitOfWork.SaveChangesAsync(ct);
                throw;
            }
        }
        
        var evtProcessed = new OrderProcessedEvent(
            OrderId: order.Id,
            CustomerId: order.CustomerId,
            Items: items.Select(oi => new OrderProcessedItem(
                ProductId: oi.ProductId, 
                Qauntity: oi.Qauntity, 
                UnitPrice: oi.UnitPrice)).ToList()
        );

        _outbox.Enqueue("OrderProcessed", JsonSerializer.Serialize(evtProcessed));

        await _unitOfWork.SaveChangesAsync(ct);
    }
}
