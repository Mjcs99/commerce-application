using System.Threading.Tasks;
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
        foreach(var item in order.Items)
        {
            _logger.LogWarning(
                "Item: ProductId={ProductId}, Name={Name}, Qty={Qty}, Price={Price}",
                item.ProductId,
                item.Name,
                item.Quantity,
                item.UnitPrice
            );
        }
        
        _db.Orders.Add(order);
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
        foreach(var order in orders){
        foreach(var item in order.Items)
        {
            _logger.LogWarning(
                "Item: ProductId={ProductId}, Name={Name}, Qty={Qty}, Price={Price}",
                item.ProductId,
                item.Name,
                item.Quantity,
                item.UnitPrice
            );
        }
        }
        
       
    
        return orders;
    }
}