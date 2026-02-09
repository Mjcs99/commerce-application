namespace Commerce.Application.Services;

using Commerce.Application.Interfaces.In;
using Commerce.Application.Interfaces.Out;
using Commerce.Application.Orders.Commands;
using Commerce.Domain.Entities;
using Commerce.Application.Exceptions;
using System.Text.Json;
using Commerce.Contracts.IntegrationContracts.Orders;
using Commerce.Contracts.Orders;
using Microsoft.Extensions.Logging;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOutbox _outbox;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IProductImageUriBuilder _uriBuilder;
    private readonly ILogger<OrderService> _logger;
    public OrderService(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IOutbox outbox,
        IUnitOfWork unitOfWork,
        IProductImageUriBuilder uriBuilder,
        ILogger<OrderService> logger)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _outbox = outbox;
        _unitOfWork = unitOfWork;
        _uriBuilder = uriBuilder;
        _logger = logger;
    }

    public async Task<Guid> CreateOrderAsync(PlaceOrderRequest request, Guid customerId, CancellationToken ct)
    {
        var order = Order.Create(customerId);

        foreach (var orderItem in request.Items) {
            var product = await _productRepository.GetProductByIdAsync(orderItem.ProductId, ct) ?? throw new NotFoundException($"Product with ID: {orderItem.ProductId} not found");
            if (orderItem.Quantity <= 0) throw new ValidationException("Quantity must be greater than 0.");
            order.AddItem(product.Id, product.Name, orderItem.Quantity, product.PriceAmount, _uriBuilder.BuildUri(product.GetPrimaryImage()?.BlobName, 3600));
        }

        _orderRepository.AddOrder(order);

        var evt = new OrderPlacedEvent(
            OrderId: order.Id,
            CustomerId: order.CustomerId,
            Items: [.. order.Items.Select(i =>
                new OrderPlacedItem(i.ProductId, i.Quantity, i.UnitPrice))]
        );
    
        var payload = JsonSerializer.Serialize(evt);
        _outbox.Enqueue("OrderPlaced", payload);    
     
        await _unitOfWork.SaveChangesAsync(ct);    
        
        return order.Id;
    }

    private static GetOrdersResponse MapToGetOrdersResponse(
    IReadOnlyList<Order> orders)
    {
        return new GetOrdersResponse(
            orders.Select(o => new OrderDTO(
                OrderId: o.Id,
                CustomerId: o.CustomerId,
                Status: o.Status.ToString(),
                CreatedAtUtc: o.CreatedAtUtc,
                Items: o.Items.Select(i => new OrderItemDTO(
                    Id: i.Id,
                    ProductId: i.ProductId,
                    Name: i.Name ?? "",
                    Quantity: i.Quantity,
                    Price: i.UnitPrice,
                    PrimaryImageUrl: i.PrimaryImageUrl ?? ""
                )).ToList()
            )).ToList()
        );
    }

    public async Task<GetOrdersResponse> GetOrdersAsync(Guid customerId, CancellationToken ct)
    {
        var orders = await _orderRepository.GetOrders(customerId, ct);
        if (orders.Count == 0) throw new NotFoundException($"No Orders Found for customer with ID: {customerId}");
        return MapToGetOrdersResponse(orders);
    }
}