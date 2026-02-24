namespace Commerce.Api.Realtime;
using Commerce.Application.Interfaces.Out;
using Microsoft.AspNetCore.SignalR;
using Commerce.Api.Hubs;

public sealed class SignalROrderRealtimeNotifier : IHubPublisher
{
    private readonly IHubContext<OrdersHub> _hubContext;

    public SignalROrderRealtimeNotifier(IHubContext<OrdersHub> hubContext)
    {
        _hubContext = hubContext;
    }

    private static string Group(string orderId) => $"order-{orderId}".ToLowerInvariant();

    public Task PublishOrderPlacedAsync(Guid orderId, CancellationToken ct)
        => _hubContext.Clients
            .Group(Group(orderId.ToString()))
            .SendAsync("OrderStatus", new {orderId = orderId.ToString(), status = "Confirmed"}, cancellationToken: ct);
    public Task PublishOrderFailedAsync(Guid orderId, string failureReason, CancellationToken ct)
        => _hubContext.Clients
            .Group(Group(orderId.ToString()))
            .SendAsync("OrderStatus", new {orderId = orderId.ToString(), status = "Failed", reason = failureReason}, cancellationToken: ct);

}
