using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Interfaces.In;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Commerce.Application.Orders.Commands;
using Commerce.Domain.Entities;
using System.Text;

namespace Commerce.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/order")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICustomerService _customerService;
    private readonly ILogger<OrderController> _logger;
    
    public OrderController(IOrderService orderService, ICustomerService customerService, ILogger<OrderController> logger)
    {
        _orderService = orderService;
        _customerService = customerService;
        _logger = logger;
    }
    
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> PlaceOrderAsync(
        [FromBody] PlaceOrderRequest request,
        CancellationToken ct)
    {
        var externalUserId = User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier");
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (externalUserId == null || email == null) return Unauthorized();
        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName = User.FindFirstValue(ClaimTypes.Surname);;
        var customer = await _customerService.GetOrCreateCustomerAsync(externalUserId, email, firstName, lastName, ct);
        if (customer == null) return Unauthorized();
        var orderId = await _orderService.CreateOrderAsync(request, customer.Id, ct);
        return Ok($"Order ID: {orderId} placed successfully for customer {customer.Id}");
    }
}