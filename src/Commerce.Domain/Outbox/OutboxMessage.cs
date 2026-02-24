namespace Commerce.Domain.Outbox;
public sealed class OutboxMessage
{
    public Guid Id { get; init; } = Guid.NewGuid();
    public required string Type { get; init; }        
    public required string Payload { get; init; }     
    public DateTime OccurredAtUtc { get; init; } = DateTime.UtcNow;
    public DateTime? DispatchedAtUtc { get; set; }    

    public void MarkProcessed(DateTime processedAtUtc)
    {
        DispatchedAtUtc = processedAtUtc;
    }
}
