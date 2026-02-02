namespace Commerce.Contracts.Orders;
public sealed record PlaceOrderResponse(
    Guid OrderId,
    Guid CustomerId,
    string Status
);