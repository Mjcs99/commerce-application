using Commerce.Application.Products.Results;
using Commerce.Application.Interfaces.In;
using Commerce.Domain.Entities;
using Commerce.Application.Products.Queries;
using Commerce.Application.Products.Commands;
using Commerce.Application.Common;
using Commerce.Application.Interfaces.Out;
using Microsoft.Extensions.Logging;
using Commerce.Application.Exceptions;
using Commerce.Contracts.Products;

namespace Commerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    private readonly IProductImageUriBuilder _imageUriBuilder;
    private readonly IProductImageStorage _imageStorage;
    private readonly ILogger<ProductService> _logger;

    public ProductService(IProductRepository repo, IProductImageUriBuilder imageUriBuilder, IProductImageStorage imageStorage, ILogger<ProductService> logger)
    {
        _repo = repo;
        _imageUriBuilder = imageUriBuilder;
        _imageStorage = imageStorage;
        _logger = logger;
    }

    public async Task<PagedQueryResult<ProductResult>> GetProductsAsync(GetProductsQuery query, CancellationToken ct)
    {
        var (products, totalCount) = await _repo.GetPagedAsync(query.SearchTerm, query.CategorySlugs, query.Page, query.PageSize, ct);
        var results = products.Select(p =>
        {
            var primaryImage = p.GetPrimaryImage();
            var imageUri = _imageUriBuilder.BuildUri(primaryImage?.BlobName, 3600);
            return Map(p, imageUri);
        }).ToList();

        return new PagedQueryResult<ProductResult>(results, totalCount);
    }

    public async Task<ProductResult> GetProductByIdAsync(Guid productId, CancellationToken ct)
    {
        var product = await _repo.GetProductByIdAsync(productId, ct);
        var primaryImage = product?.GetPrimaryImage();
        return product is null ? throw new NotFoundException($"Product not found with ID: {productId}") : Map(product, _imageUriBuilder.BuildUri(primaryImage?.BlobName, 3600));
    }

    private static ProductResult Map(Product p, string? imageUri)
        => new(p.Id, p.Name, p.Sku, p.PriceAmount, imageUri);

    public async Task<ProductResult> GetProductBySkuAsync(string sku, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(sku)) throw new ArgumentException("SKU cannot be null or whitespace.", nameof(sku)); 

        var product = await _repo.GetProductBySkuAsync(sku, ct);
        var primaryImage = product?.GetPrimaryImage();
        return product is null ? throw new NotFoundException($"Product not found with SKU: {sku}") : Map(product, _imageUriBuilder.BuildUri(primaryImage?.BlobName, 3600));
    }

    public async Task<Guid> AddProductAsync(CreateProductDto command, CancellationToken ct)
    {
        var categoryId = await _repo.GetCategoryIdBySlugAsync(command.CategorySlug, ct);

        if (categoryId is null)
            throw new ValidationException("Invalid category: category does not exist."); 

        var product = Product.Create(
            sku: command.Sku,
            name: command.Name,
            categoryId: categoryId.Value,
            priceAmount: command.Price,
            description: command.description
            );

        await _repo.CreateAsync(product, ct);

        return product.Id;
    }

    public async Task<AddImageResult> AddImageAsync(AddProductImageCommand command, CancellationToken ct)
    {
        var product = await _repo.GetProductByIdAsync(command.ProductId, ct);
        if (product is null)
            return new AddImageResult(false, null, "Product not found.");

        var imageId = Guid.NewGuid();
        var extension = Path.GetExtension(command.FileName);
        var blobName = $"products/{command.ProductId}/images/{imageId}{extension}";

        if (command.Content.CanSeek)
            command.Content.Position = 0;

        BlobUploadResult upload;

        try
        {
            upload = await _imageStorage.UploadAsync(
                blobName,
                command.Content,
                command.ContentType,
                ct);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to add blob {BlobName} for ProductId {ProductId}", blobName, command.ProductId);
            throw new BlobStorageException("Failed to upload image to blob storage.", ex);
        }

        try
        {
            await _repo.AddImageAsync(
                productId: command.ProductId,
                blobName: blobName,
                imageId: imageId,
                makePrimary: command.IsPrimary,
                ct: ct);

            return new AddImageResult(true, imageId, upload.Url);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            try
            {
                await _imageStorage.DeleteIfExistsAsync(blobName, CancellationToken.None);
            }
            catch (Exception cleanupException)
            {
                _logger.LogWarning(cleanupException, "Failed to cleanup blob {BlobName} for ProductId {ProductId}", blobName, command.ProductId);

            }
            _logger.LogWarning("Failed to upload product image: {exception}", ex);
            throw;
        }
    }

    public async Task<ProductDetailsDto> GetProductDetailsByIdAsync(Guid productId, CancellationToken ct)
    {
        var product = await _repo.GetProductDetailsByIdAsync(productId, ct)
            ?? throw new NotFoundException($"Cannot find product with ID: {productId}");

        return new ProductDetailsDto(product.Id, product.Name, product.PriceAmount, product.Images.Select(i => _imageUriBuilder.BuildUri(i.BlobName, 3600)), product.Description);

    }
}
