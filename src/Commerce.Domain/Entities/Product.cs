using System.Dynamic;

namespace Commerce.Domain.Entities;

public sealed class Product
{
    private readonly List<ProductImage> _images = new();
    public IReadOnlyCollection<ProductImage> Images => _images;

    public Guid Id { get; private set; }
    public string Sku { get; private set; } = null!;
    public string Name { get; private set; } = null!;
    public Guid CategoryId { get; private set; }
    public Category? Category { get; private set; }
    public decimal PriceAmount { get; private set; }
    public string Description { get; private set; } = null!;
    public DateTime CreatedAtUtc {get; private set;}

    private Product() { } 

    public Product(Guid id, string sku, string name, Guid categoryId, decimal priceAmount, string description)
    {
        Id = id;
        Sku = sku;
        Name = name;
        PriceAmount = priceAmount;
        CategoryId = categoryId;
        Description = description;
        CreatedAtUtc = DateTime.UtcNow;
    }
    
    public static Product Create(string sku, string name, Guid categoryId, decimal priceAmount, string description)
        => new(Guid.NewGuid(), sku, name, categoryId, priceAmount, description);

    public ProductImage GetPrimaryImage()
    {
        return Images.First(i => i.IsPrimary);
    }

    public ProductImage AddImage(string blobName, Guid imageId, bool makePrimary)
    {
        if (makePrimary) SetAllImagesNonPrimary();
        
        var image = new ProductImage(productId: Id, blobName: blobName, imageId: imageId, isPrimary: makePrimary);
        
        _images.Add(image);
        
        return image;
    }

    public void SetPrimaryImage(Guid imageId)
    {
        var target = _images.FirstOrDefault(i => i.Id == imageId)
            ?? throw new InvalidOperationException("Image not found for this product.");

        SetAllImagesNonPrimary();
        target.SetPrimary();
    }

    private void SetAllImagesNonPrimary()
    {
        foreach (var img in _images)
            img.UnsetPrimary();
    }
}
