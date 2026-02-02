namespace Commerce.Application.Interfaces.Out;
public interface IHubPublisher
{
    Task PublishOrderPlacedAsync(Guid orderId, CancellationToken ct);
    Task PublishOrderFailedAsync(Guid orderId, CancellationToken ct);
}