using System.Threading.Tasks;
using Azure.Core;
using Commerce.Application.Interfaces.Out;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Commerce.Infrastructure.Repositories;

public class EfOrderRepository : IOrderRepository
{
    private readonly CommerceDbContext _db;

    ILogger<EfOrderRepository> _logger;

    public EfOrderRepository(CommerceDbContext db, ILogger<EfOrderRepository> logger)
    {
        _db = db;
        _logger = logger;
    }
    
    public void AddOrder(Order order)
    {
        _db.Orders.Add(order);
    }

    public async Task DeleteFailedOrdersAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddDays(-7);
        var deletedCount = await _db.Orders
            .Where(order =>
                order.FailureAcknowledgedAtUtc != null 
                || (order.Status == OrderStatus.Cancelled && order.CreatedAtUtc < cutoff) 
                || (order.Status == OrderStatus.Pending && order.CreatedAtUtc < cutoff))
            .Take(10)
            .ExecuteDeleteAsync(ct);
        _logger.LogInformation("Deleted {num} failed orders from db", deletedCount);
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _db.Orders
            .Include(o => o.Items)              
            .SingleOrDefaultAsync(o => o.Id == id, ct);
    }

    public async Task<IReadOnlyList<Order>> GetOrders(Guid customerId, CancellationToken ct = default)
    {
        var orders = await _db.Orders
            .Include(order => order.Items)
            .Where(order => order.CustomerId == customerId)
            .OrderBy(order => order.CreatedAtUtc)
            .Reverse()
            .ToListAsync();
        return orders;
    }

    public async Task RemoveOrder(Guid id)
    {
        var order = await _db.Orders.FirstAsync(o => o.Id == id);
        _db.Orders.Remove(order);
    }
}   