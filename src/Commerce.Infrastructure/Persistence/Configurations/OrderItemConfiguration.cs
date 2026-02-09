using Microsoft.EntityFrameworkCore;
using Commerce.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Commerce.Infrastructure.Persistence.Configurations;

public sealed class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(oi => oi.Id);
        builder.Property(oi => oi.OrderId).IsRequired();
        builder.Property(oi => oi.ProductId).IsRequired();
        builder.Property(oi => oi.Quantity).IsRequired();
        builder.Property(oi => oi.UnitPrice).IsRequired();
        builder.Property(oi => oi.Name).IsRequired();
        builder.Property(oi => oi.PrimaryImageUrl).IsRequired();
        builder.HasOne<Order>()
            .WithMany(o => o.Items)              
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Restrict);  
    }
}