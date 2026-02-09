namespace Commerce.Infrastructure.Images;
using Commerce.Infrastructure.Options;
using Commerce.Application.Interfaces.Out;
using Microsoft.Extensions.Options;

using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
public sealed class AzureBlobProductImageUriBuilder : IProductImageUriBuilder
{
    private readonly string _accountName;
    private readonly string _containerName;
    private readonly StorageSharedKeyCredential _cred;
    
    public AzureBlobProductImageUriBuilder(IOptions<BlobStorageOptions> options)
    {
        _accountName = options.Value.AccountName;
        _containerName = options.Value.ContainerName;
        _cred = new StorageSharedKeyCredential(options.Value.AccountName, options.Value.AccountKey);
       
    }

    public string BuildUri(string? primaryImageBlobName, int sasMinutes)
    {
        var now = DateTimeOffset.UtcNow;

        var sas = new BlobSasBuilder
        {
            BlobContainerName = _containerName,
            BlobName = primaryImageBlobName ?? string.Empty,
            Resource = "b",
            StartsOn = now.AddMinutes(-1),
            ExpiresOn = now.AddMinutes(sasMinutes),
            Protocol = SasProtocol.Https
        };

        sas.SetPermissions(BlobSasPermissions.Read);

        var query = sas.ToSasQueryParameters(_cred).ToString();

        var baseUri = new Uri($"https://{_accountName}.blob.core.windows.net/{_containerName}/{primaryImageBlobName}");
        return $"{baseUri}?{query}";
    }

   
}