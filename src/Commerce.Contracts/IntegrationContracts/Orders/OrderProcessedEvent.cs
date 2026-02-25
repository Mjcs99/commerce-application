namespace Commerce.Contracts.IntegrationContracts.Orders;

public sealed record OrderProcessedEvent(
    Guid OrderId,
    Guid CustomerId,
    IReadOnlyList<OrderProcessedItem> Items
);

public sealed record OrderProcessedItem(
    Guid ProductId,
    int Qauntity,
    decimal UnitPrice
);

public sealed record OrderFailedEvent(Guid OrderId, string FailureReason);