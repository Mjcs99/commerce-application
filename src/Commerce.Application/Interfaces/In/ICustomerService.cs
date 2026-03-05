using Commerce.Contracts.Customers;
using Commerce.Domain.Entities;

namespace Commerce.Application.Interfaces.In;
public interface ICustomerService
{
    public Task<Customer> GetOrCreateCustomerAsync(string externalCustomerId, string email, string? firstName, string? lastName, CancellationToken ct);
    public Task<Customer> GetCustomerByIdAsync(Guid id, CancellationToken ct);
    public Task<bool> UpdateCustomerDetailsAsync(string externalUserId, UpdateCustomerRequest request, CancellationToken ct);
    public Task<Customer> GetCustomerByExternalIdAsync(string externalId, CancellationToken ct);
}