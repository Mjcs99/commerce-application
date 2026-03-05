using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Interfaces.In;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Commerce.Application.Orders.Commands;
using Commerce.Contracts.Orders;
using Commerce.Application.Exceptions;
using Microsoft.AspNetCore.Identity;

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
    private readonly IAuthorizationService _auth;
    private readonly ILogger<OrderController> _logger;

    
    public OrderController(IOrderService orderService, ICustomerService customerService, IOrderStatusReader statusReader, IAuthorizationService auth, ILogger<OrderController> logger)
    {
        _orderService = orderService;
        _customerService = customerService;
        _statusReader = statusReader;
        _auth = auth;
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
    public async Task<IActionResult> GetOrder([FromRoute] Guid id, CancellationToken ct)
    {
        var allowed = await _auth.AuthorizeAsync(User, id, "CanAccessOrder");
        if (!allowed.Succeeded) return Forbid();
        var order = await _orderService.GetOrderAsync(id, ct);
        return Ok(order);
    }

    [HttpGet("{id:guid}/status")]
    public async Task<IActionResult> GetOrderStatus([FromRoute] Guid id, CancellationToken ct)
    {
        var allowed = await _auth.AuthorizeAsync(User, id, "CanAccessOrder");
        if (!allowed.Succeeded) return Forbid();
        var result = await _statusReader.GetOrderStatus(id, ct);
        
        return Ok(new OrderStatusDTO(result.ToString()));
    }

    [HttpPost("{id:guid}/ack-failure")]
    public async Task<IActionResult> FailOrder([FromRoute] Guid id, CancellationToken ct)
    {
        var allowed = await _auth.AuthorizeAsync(User, id, "CanAccessOrder");
        if (!allowed.Succeeded) return Forbid();
        
        await _orderService.SetFailedAsync(id, ct);
     
        return Ok();
    }
    
}