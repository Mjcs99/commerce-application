namespace Commerce.Application.Interfaces.Out;

public interface IProductImageUriBuilder
{
    string BuildUri(string? primaryImageBlobName, int sasMinutes);
}