using Microsoft.EntityFrameworkCore;
using Commerce.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace Commerce.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.CustomerId).IsRequired();
        builder.Property(o => o.Status)
            .HasConversion<string>()
            .IsRequired();
        builder.Property(o => o.CreatedAtUtc).IsRequired();
        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(o => o.Items)
            .WithOne()                        
            .HasForeignKey(oi => oi.OrderId)   
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);
        builder.Property(o => o.FailureAcknowledgedAtUtc);
        builder.Navigation(o => o.Items).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

