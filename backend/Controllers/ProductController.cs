using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? sortBy)
    {
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchLower) || 
                                     p.Description.ToLower().Contains(searchLower));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category.ToLower() == category.ToLower());
        }

        // Apply Sorting
        query = sortBy?.ToLower() switch
        {
            "price-low" => query.OrderBy(p => (double)p.Price),
            "price-high" => query.OrderByDescending(p => (double)p.Price),
            "rating" => query.OrderByDescending(p => p.Rating),
            _ => query.OrderBy(p => p.Id) // Default sorting
        };

        return await query.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product == null)
        {
            return NotFound($"Product with ID {id} not found.");
        }

        return product;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Products
            .Select(p => p.Category)
            .Distinct()
            .ToListAsync();

        return categories;
    }
}
