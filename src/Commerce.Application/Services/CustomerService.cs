namespace Commerce.Application.Services;

using Commerce.Application.Exceptions;
using Commerce.Application.Interfaces.In;
using Commerce.Application.Interfaces.Out;
using Commerce.Contracts.Customers;
using Commerce.Domain.Entities;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(ICustomerRepository customerRepository, IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Customer> GetOrCreateCustomerAsync(string externalCustomerId, string email, string? firstName, string? lastName, CancellationToken ct)
    {
        var customer = await _customerRepository.GetCustomerByExternalIdAsync(externalCustomerId, ct);
        if (customer == null)
        {
            customer = Customer.Create(externalCustomerId, email, firstName, lastName);
            await _customerRepository.AddCustomerAsync(customer, ct);
        }
        await _unitOfWork.SaveChangesAsync(ct);
        return customer;
    }

    public async Task<Customer> GetCustomerByIdAsync(Guid customerId, CancellationToken ct)
    {
        return await _customerRepository.GetCustomerByIdAsync(customerId, ct) ?? throw new NotFoundException($"Customer not found - {customerId}");
    }

    public async Task<bool> UpdateCustomerDetailsAsync(
    string externalUserId,
    UpdateCustomerRequest request,
    CancellationToken ct)
    {
        var customer = await _customerRepository
            .GetCustomerByExternalIdAsync(externalCustomerId: externalUserId, ct);

        if (customer is null)
            return false;

        ShippingAddress? address = null;

        if (request.ShippingAddress is not null)
        {
            address = new ShippingAddress(
                request.ShippingAddress.Line1,
                request.ShippingAddress.Line2,
                request.ShippingAddress.City,
                request.ShippingAddress.Province,
                request.ShippingAddress.PostalCode,
                request.ShippingAddress.Country
            );
        }

        customer.UpdateDetails(
            request.FirstName,
            request.LastName,
            address
        );

        await _unitOfWork.SaveChangesAsync(ct);
        return true;
    }

    public async Task<Customer> GetCustomerByExternalIdAsync(string externalId, CancellationToken ct)
    {
        return await _customerRepository.GetCustomerByExternalIdAsync(externalId, ct) ?? throw new NotFoundException($"Customer not found - {externalId}");
    }
}