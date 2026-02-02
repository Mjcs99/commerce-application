namespace Commerce.Api.Hubs;

using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
public sealed class OrdersHub : Hub
{
    public async Task JoinOrder(string orderId){
        await Groups.AddToGroupAsync(Context.ConnectionId, Group(orderId));
    }

    public Task LeaveOrder(string orderId)
        => Groups.RemoveFromGroupAsync(Context.ConnectionId, Group(orderId));

    public static string Group(string orderId)
        => $"order-{orderId}".ToLowerInvariant();
}