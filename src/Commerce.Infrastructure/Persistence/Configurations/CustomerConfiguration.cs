using Microsoft.EntityFrameworkCore;
using Commerce.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Commerce.Infrastructure.Persistence.Configurations;

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.ExternalUserId).IsRequired().HasMaxLength(100);
        builder.HasIndex(c => c.ExternalUserId).IsUnique();
        builder.Property(c => c.FirstName).HasMaxLength(50);
        builder.Property(c => c.LastName).HasMaxLength(50);
        builder.Property(c => c.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(c => c.Email).IsUnique();
        builder.Property(c => c.CreatedAtUtc).IsRequired(); 
        builder.OwnsOne(c => c.ShippingAddress, sa =>
        {
            sa.Property(a => a.Line1).HasColumnName("Shipping_Line1").HasMaxLength(200);
            sa.Property(a => a.Line2).HasColumnName("Shipping_Line2").HasMaxLength(200);
            sa.Property(a => a.City).HasColumnName("Shipping_City").HasMaxLength(100);
            sa.Property(a => a.Province).HasColumnName("Shipping_Province").HasMaxLength(50);
            sa.Property(a => a.PostalCode).HasColumnName("Shipping_PostalCode").HasMaxLength(20);
            sa.Property(a => a.Country).HasColumnName("Shipping_Country").HasMaxLength(80);
        });
    }
}