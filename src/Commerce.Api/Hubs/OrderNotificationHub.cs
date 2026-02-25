namespace Commerce.Api.Hubs;

using System.Threading.Tasks;
using Commerce.Application.Services;
using Microsoft.AspNetCore.SignalR;
public sealed class OrdersHub : Hub
{
    private readonly OrderStatusReader _statusReader;
    public OrdersHub(OrderStatusReader statusReader) => _statusReader = statusReader;

    public Task JoinOrder(string orderId)
        => Groups.AddToGroupAsync(Context.ConnectionId, Group(orderId));

    public Task LeaveOrder(string orderId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, Group(orderId));

    public static string Group(string orderId)
        => $"order-{orderId}".ToLowerInvariant();

    
}