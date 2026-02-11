using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Interfaces.In;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Commerce.Contracts.Customers;

namespace Commerce.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/customer")]
public class CustomerController : ControllerBase
{
    private readonly ICustomerService _customerService;
    
    public CustomerController(ICustomerService customerService)
    {
        _customerService = customerService;
    }
    
    [Authorize]
    [HttpPost("me")]
    public async Task<IActionResult> GetOrCreateCustomer(CancellationToken ct)
    {
        var externalUserId = User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier");
        if (externalUserId == null)
        {
            Console.WriteLine("No sub or 'oid claim found for the user.");
            return Forbid();
        }
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email == null)
        {
            Console.WriteLine("No email claim found for the user.");
            return Forbid();
        }
        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var lastName = User.FindFirstValue(ClaimTypes.Surname);
        var customer = await _customerService.GetOrCreateCustomerAsync(externalUserId, email, firstName, lastName, ct);
        return Ok(customer);
    }

    [Authorize]
    [HttpPatch("me")]
    public async Task<IActionResult> UpdateUserDetails(UpdateCustomerRequest request, CancellationToken ct)
    {
        var externalUserId = User.FindFirstValue("http://schemas.microsoft.com/identity/claims/objectidentifier");
        if (externalUserId == null)
        {
            Console.WriteLine("No sub or 'oid claim found for the user.");
            return Forbid();
        }
        await _customerService.UpdateCustomerDetailsAsync(externalUserId, request, ct);
        return NoContent();
    }
}