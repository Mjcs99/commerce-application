namespace Commerce.Contracts.Customers;
public sealed record UpdateCustomerRequest(
    string? FirstName,
    string? LastName,
    UpdateShippingAddressRequest? ShippingAddress
);

public sealed record UpdateShippingAddressRequest(
    string Line1,
    string? Line2,
    string City,
    string Province,
    string PostalCode,
    string Country
);