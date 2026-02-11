namespace Commerce.Domain.Entities;

public sealed class Customer
{
    public Guid Id { get; private set; }
    public string ExternalUserId { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public DateTime CreatedAtUtc { get; private set; }
    public ShippingAddress? ShippingAddress { get; private set; }

    private Customer() { } 

    private Customer(Guid id, string externalUserId, string email, string firstName, string lastName)
    {
        Id = id;
        ExternalUserId = externalUserId;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public void UpdateDetails(string? firstName, string? lastName, ShippingAddress? shippingAddress)
    {
        firstName = firstName is null ? string.Empty : firstName;
        lastName = lastName is null ? string.Empty : lastName;
        FirstName = firstName;
        LastName = lastName;
        ShippingAddress = shippingAddress;
    }

    public static Customer Create(string externalUserId, string email, string? firstName, string? lastName)
    {
        if (string.IsNullOrWhiteSpace(externalUserId)) throw new ArgumentException("ExternalUserId is required.", nameof(externalUserId));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.", nameof(email));
        email = email.Trim().ToLowerInvariant();
        firstName = firstName is null ? string.Empty : firstName;
        lastName = lastName is null ? string.Empty : lastName;
        return new Customer(Guid.NewGuid(), externalUserId.Trim(), email, firstName, lastName);
    }
}

public sealed class ShippingAddress
{
    public string Line1 { get; private set; } = null!;
    public string? Line2 { get; private set; }
    public string City { get; private set; } = null!;
    public string Province { get; private set; } = null!;
    public string PostalCode { get; private set; } = null!;
    public string Country { get; private set; } = null!;

    private ShippingAddress() { }
    public ShippingAddress(string line1, string? line2, string city, string province, string postalCode, string country)
    {
        Line1 = line1;
        Line2 = line2;
        City = city;
        Province = province;
        PostalCode = postalCode;
        Country = country;
    }
}

