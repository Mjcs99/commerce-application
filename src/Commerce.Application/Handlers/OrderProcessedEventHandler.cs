using Commerce.Application.Interfaces.In;
using Commerce.Domain.Entities;
using Commerce.Application.Interfaces.Out;
using System.Text.Json;
using Commerce.Contracts.IntegrationContracts.Orders;
using Microsoft.Extensions.Logging;
public class OrderProcessedEventHandler : IIntegrationEventHandler
{
    private readonly IHubPublisher _hubPublisher;
    private readonly ILogger<OrderProcessedEventHandler> _logger;

    public OrderProcessedEventHandler(IHubPublisher hubPublisher, ILogger<OrderProcessedEventHandler> logger)
    {
        _hubPublisher = hubPublisher;
        _logger = logger;
    }   
    public bool CanHandle(string type)
    {
        return true && type == "OrderProcessed";
    }

    public Task HandleAsync(string type, string payload, CancellationToken ct)
    {
        var evt = JsonSerializer.Deserialize<OrderProcessedEvent>(
            payload,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        ) ?? throw new InvalidDataException($"Invalid Message: {payload}");
        return _hubPublisher.PublishOrderPlacedAsync(evt.OrderId, ct);
    }
}