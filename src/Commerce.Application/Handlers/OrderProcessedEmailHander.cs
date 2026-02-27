using System.Text.Json;
using Commerce.Application.Interfaces.In;
using Commerce.Application.Interfaces.Out;
using Commerce.Contracts.IntegrationContracts.Orders;

namespace Commerce.Application.Handlers;

public class OrderProcessedEmailHandler : IIntegrationEventHandler
{
    private readonly IEmailSender _emailSender;
    public OrderProcessedEmailHandler(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }
    public bool CanHandle(string type)
    {
        return true && type == "OrderProcessed";
    }
    public async Task HandleAsync(string type, string payload, CancellationToken ct)
    {
        var evt = JsonSerializer.Deserialize<OrderProcessedEvent>(
            payload,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }
        ) ?? throw new InvalidDataException($"Invalid Message: {payload}");

        await _emailSender.SendOrderConfirmationEmail(evt.CustomerId, evt.OrderId, evt.Items, ct);
    }
}
