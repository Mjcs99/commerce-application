using System.Security.Claims;
using Commerce.Application.Interfaces.In;
using Microsoft.AspNetCore.Authorization;
namespace Commerce.Api.Auth.Handlers;
public sealed class OrderOwnerHandler : AuthorizationHandler<OrderOwnerRequirement, Guid>
{
    private readonly ICustomerService _customers;
    private readonly IOrderService _orders;

    public OrderOwnerHandler(ICustomerService customers, IOrderService orders)
    {
        _customers = customers;
        _orders = orders;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Guid orderId)
    {
        if (context.User.IsInRole("Admin"))
        {
            context.Succeed(requirement);
            return;
        }

        var externalUserId =
            context.User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
            ?? context.User.FindFirstValue("oid")
            ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(externalUserId))
            return; 

        var customer = await _customers.GetCustomerByExternalIdAsync(externalUserId, CancellationToken.None);
        if (customer is null)
            return;

        var order = await _orders.GetOrderAsync(orderId, CancellationToken.None);
        if (order is null)
            return;

        if (order.CustomerId == customer.Id)
            context.Succeed(requirement);
    }
}