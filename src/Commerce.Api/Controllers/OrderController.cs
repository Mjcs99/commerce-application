using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Interfaces.In;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Commerce.Application.Orders.Commands;
using Commerce.Contracts.Orders;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Commerce.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ICustomerService _customerService;
    private readonly IOrderStatusReader _statusReader;
    private readonly ILogger<OrderController> _logger;
    
    public OrderController(IOrderService orderService, ICustomerService customerService, IOrderStatusReader statusReader, ILogger<OrderController> logger)
    {
        _orderService = orderService;
        _customerService = customerService;
        _statusReader = statusReader;
        _logger = logger;
    }
    
    [HttpPost]
    public async Task<IActionResult> PlaceOrderAsync(
        [FromBody] PlaceOrderRequest request,
        CancellationToken ct)
    {
        if (request is null)
            return BadRequest("Request body is required.");

        var externalUserId =
            User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
            ?? User.FindFirstValue("oid")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        var email =
            User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("emails") 
            ?? User.FindFirstValue("preferred_username");

        if (string.IsNullOrWhiteSpace(externalUserId) || string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName  = User.FindFirstValue(ClaimTypes.Surname);

        var customer = await _customerService.GetOrCreateCustomerAsync(
            externalUserId,
            email,
            firstName,
            lastName,
            ct);

        if (customer is null)
            return Unauthorized();
        
        var orderId = await _orderService.CreateOrderAsync(request, customer.Id, ct);

        var response = new PlaceOrderResponse(
            orderId,
            customer.Id,
            "Processing"
        );

        return Accepted(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrdersAsync(
        CancellationToken ct)
    {
        var externalUserId =
            User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier")
            ?? User.FindFirstValue("oid")
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        var email =
            User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("emails") 
            ?? User.FindFirstValue("preferred_username");

        if (string.IsNullOrWhiteSpace(externalUserId) || string.IsNullOrWhiteSpace(email))
            return Unauthorized();

        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName  = User.FindFirstValue(ClaimTypes.Surname);

        var customer = await _customerService.GetOrCreateCustomerAsync(
            externalUserId,
            email,
            firstName,
            lastName,
            ct);

        if (customer is null)
            return Unauthorized();
        
        var orders = await _orderService.GetOrdersAsync(customer.Id, ct);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> getOrder([FromRoute] Guid id, CancellationToken ct)
    {
        var order = await _orderService.GetOrderAsync(id, ct);
        return Ok(order);
    }

    [HttpGet("{id:guid}/status")]
    public async Task<IActionResult> GetOrder(string id, CancellationToken ct)
    {
        if (!Guid.TryParse(id, out var orderId))
            return BadRequest("Invalid orderId.");

        var result = await _statusReader.GetOrderStatus(orderId, ct);
        
        return Ok(new OrderStatusDTO(result.ToString()));
    }
}