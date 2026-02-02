using Commerce.Application.Interfaces.Out;
using Azure.Messaging.ServiceBus;

namespace Commerce.Infrastructure.Messaging;

public sealed class AzureServiceBusMessageBus : IMessageBus
{
    private readonly ServiceBusClient _client;
    private readonly ServiceBusSender _sender;

    public AzureServiceBusMessageBus(ServiceBusClient client)
    {
        _client = client;
        _sender = _client.CreateSender("commerce-orders");
    }

    public async Task PublishAsync(Guid messageId, string type, string payload, CancellationToken ct)
    {
        var sbMessage = new ServiceBusMessage(payload)
        {
            MessageId = messageId.ToString(),
            Subject = type,
            ContentType = "application/json"
        };
        await _sender.SendMessageAsync(sbMessage, ct);
    }
}
