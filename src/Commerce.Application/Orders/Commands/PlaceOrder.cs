using System.Text.Json.Serialization;

namespace Commerce.Application.Orders.Commands;
public sealed record PlaceOrderRequest(
    [property: JsonPropertyName("items")]
    IReadOnlyList<OrderLineRequest> Items);

public sealed record OrderLineRequest(
    [property: JsonPropertyName("productId")] Guid ProductId,
    [property: JsonPropertyName("quantity")] int Quantity);