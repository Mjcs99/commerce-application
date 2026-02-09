namespace Commerce.Infrastructure;
using Commerce.Application.Interfaces.Out;
using Microsoft.Extensions.DependencyInjection;     
using Commerce.Infrastructure.Repositories;
using Microsoft.Extensions.Configuration;
using Commerce.Infrastructure.Images;
using Commerce.Infrastructure.Options;
using Commerce.Infrastructure.Storage;
using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;
using Commerce.Infrastructure.Messaging;
using Microsoft.Extensions.Options;
using Commerce.Infrastructure.Email;
using Azure.Messaging.ServiceBus;
using Commerce.Api.Interfaces.Out;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddScoped<IProductRepository, EfProductRepository>();
        services.AddScoped<IProductImageStorage, AzureBlobStorage>();
        services.AddSingleton<IProductImageUriBuilder, AzureBlobProductImageUriBuilder>();
        services.AddScoped<IOrderRepository, EfOrderRepository>();
        services.AddScoped<ICustomerRepository, EfCustomerRepository>();
        services.AddScoped<IInventoryRepository, EfInventoryRepository>();
        services.AddScoped<ICategoryRepository, EfCategoryRepository>();
        services.AddScoped<IOutbox, EfOutbox>();
        services.AddScoped<IUnitOfWork, EfUnitOfWork>(); 
        services.AddHostedService<EmailConsumerHostedService>();
        services.AddHostedService<OrdersConsumerHostedService>();
        services.AddSingleton<IMessageBus, AzureServiceBusMessageBus>();
        services.AddSingleton(_ => new ServiceBusClient(configuration["ServiceBus:ConnectionString"]));
        services.AddDbContext<CommerceDbContext>(options =>
            options.UseSqlite(configuration.GetConnectionString("CommerceDb")));
        services.Configure<ServiceBusOptions>(
            "OrderPlaced",
            configuration.GetSection("AzureServiceBus:OrderPlaced"));

        services.Configure<ServiceBusOptions>(
            "Email",
            configuration.GetSection("AzureServiceBus:Email"));
        services.Configure<BlobStorageOptions>(options =>
        {
            configuration.GetSection("BlobStorage").Bind(options);
        });
        services
            .AddOptions<EmailOptions>()
            .Bind(configuration.GetSection("Email"))
            .Validate(o => !string.IsNullOrWhiteSpace(o.FromAddress), "FromAddress is required")
            .Validate(o => !string.IsNullOrWhiteSpace(o.ConnectionString), "Email ConnectionString is required")
            .ValidateOnStart();
        services.AddSingleton(sp =>
        {
            var opts = sp.GetRequiredService<IOptions<EmailOptions>>().Value;
            return new Azure.Communication.Email.EmailClient(opts.ConnectionString);
        });
        
        services.AddScoped<IEmailSender, EmailSender>();
        return services;
    }
}