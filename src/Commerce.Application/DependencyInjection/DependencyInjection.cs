using Commerce.Application.Interfaces.In;
using Microsoft.Extensions.DependencyInjection;
using Commerce.Application.Services;

namespace Commerce.Application.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IOrderStatusReader, OrderStatusReader>();
        return services;
    }
}