using Commerce.Application.Interfaces.Out;
using Commerce.Application.Products.Commands;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Commerce.Application.Products.Results;
using Commerce.Infrastructure.Images;
using Microsoft.Extensions.Logging;
using SQLitePCL;

namespace Commerce.Infrastructure.Repositories;

public class EfProductRepository : IProductRepository
{
    private readonly CommerceDbContext _db;
    private readonly ILogger<EfProductRepository> _logger;
    public EfProductRepository(CommerceDbContext db, ILogger<EfProductRepository> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Guid> CreateAsync(Product product, CancellationToken ct)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);
        return product.Id;
    }

    public async Task<(IReadOnlyList<Product> items, int totalCount)> GetPagedAsync(
        string? searchTerm,
        List<string>? categorySlugs,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 200);

        List<Guid> categoryIds = new();

        if (categorySlugs?.Count > 0)
        {
            categorySlugs = categorySlugs.Select(c => c.ToLower()).ToList();
            categoryIds = await _db.Category
                .AsNoTracking()
                .Where(c => categorySlugs.Contains(c.Slug))
                .Select(c => c.Id)
                .ToListAsync(ct);
            var existingSlugs = await _db.Category
                .AsNoTracking()
                .Select(c => c.Slug)
                .ToListAsync(ct);

            _logger.LogWarning("DB slugs: {Slugs}", string.Join(", ", existingSlugs));
            _logger.LogWarning("Category slugs: {Slugs}", string.Join(", ", categorySlugs ?? new()));
            
        }

        IQueryable<Product> baseQuery = _db.Products.AsNoTracking();

        if (categoryIds?.Count > 0)
            baseQuery = baseQuery.Where(p => categoryIds.Contains(p.CategoryId));

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            baseQuery = baseQuery.Where(p =>
                EF.Functions.Like(p.Name, $"%{searchTerm}%") ||
                EF.Functions.Like(p.Sku, $"%{searchTerm}%"));
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken: ct);

        var items = await baseQuery
            .OrderBy(p => p.Name).ThenBy(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.Images.Where(i => i.IsPrimary))  
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task AddImageAsync(Guid productId, string blobName, Guid imageId, bool makePrimary, CancellationToken ct)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == productId, ct);

        if (product is null)
            throw new InvalidOperationException("Product not found.");

        var newImage = product.AddImage(blobName, imageId, makePrimary);
        _db.Entry(newImage).State = EntityState.Added;

        await _db.SaveChangesAsync(ct);
    }

    public async Task<Product?> GetProductByIdAsync(Guid id, CancellationToken ct)
        => await _db.Products
            .SingleOrDefaultAsync(p => p.Id == id, ct);
    public async Task<Product?> GetProductDetailsByIdAsync(Guid id, CancellationToken ct)
        => await _db.Products.Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id, ct);
    
    public async Task<Product?> GetProductBySkuAsync(string sku, CancellationToken ct)
        => await _db.Products
            .AsNoTracking()
            .SingleOrDefaultAsync(p => p.Sku == sku, ct);

    public async Task<Guid?> GetCategoryIdBySlugAsync(string categorySlug, CancellationToken ct)
    {
        var category = await _db.Category
            .AsNoTracking()
            .SingleOrDefaultAsync(c => c.Slug == categorySlug, ct);
        return category?.Id;
    }

}
