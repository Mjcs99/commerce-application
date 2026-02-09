namespace Commerce.Contracts.Orders;
public sealed record PlaceOrderResponse(
    Guid OrderId,
    Guid CustomerId,
    string Status
);

public sealed record OrderItemDTO(
    Guid Id,
    Guid ProductId,
    string Name,
    int Quantity,
    decimal Price,
    string PrimaryImageUrl
);

public sealed record OrderDTO(
    Guid OrderId,
    Guid CustomerId,
    string Status,
    DateTime CreatedAtUtc,
    IReadOnlyList<OrderItemDTO> Items
);

public sealed record GetOrdersResponse(
    IReadOnlyList<OrderDTO> Orders
);