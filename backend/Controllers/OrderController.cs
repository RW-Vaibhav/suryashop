using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrderController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(claim) || !int.TryParse(claim, out var userId))
        {
            throw new UnauthorizedAccessException("User claims invalid.");
        }
        return userId;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> PlaceOrder(PlaceOrderDto dto)
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Product)
            .ToListAsync();

        if (!cartItems.Any())
        {
            return BadRequest("Your shopping cart is empty.");
        }

        // Validate inventory and calculate total
        decimal totalAmount = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in cartItems)
        {
            if (item.Product == null)
            {
                return BadRequest($"Product with ID {item.ProductId} no longer exists.");
            }

            if (item.Product.StockQuantity < item.Quantity)
            {
                return BadRequest($"Product '{item.Product.Name}' is out of stock. Only {item.Product.StockQuantity} unit(s) available.");
            }

            // Deduct inventory
            item.Product.StockQuantity -= item.Quantity;

            var itemTotal = item.Product.Price * item.Quantity;
            totalAmount += itemTotal;

            orderItems.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = item.Product.Price // Lock in price at checkout
            });
        }

        // Create Order
        var order = new Order
        {
            UserId = userId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            ShippingAddress = dto.ShippingAddress,
            Status = "Processing",
            OrderItems = orderItems
        };

        _context.Orders.Add(order);

        // Clear user's cart
        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        // Map to response
        var responseDto = new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            Status = order.Status,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = cartItems.First(c => c.ProductId == oi.ProductId).Product?.Name ?? "Unknown Product",
                ProductImageUrl = cartItems.First(c => c.ProductId == oi.ProductId).Product?.ImageUrl ?? string.Empty,
                Quantity = oi.Quantity,
                Price = oi.Price
            }).ToList()
        };

        return CreatedAtAction(nameof(GetOrderById), new { id = order.Id }, responseDto);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                ShippingAddress = o.ShippingAddress,
                Status = o.Status,
                OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.Name : "Unknown Product",
                    ProductImageUrl = oi.Product != null ? oi.Product.ImageUrl : string.Empty,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            })
            .ToListAsync();

        return orders;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .SingleOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
        {
            return NotFound($"Order with ID {id} not found.");
        }

        var responseDto = new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            Status = order.Status,
            OrderItems = order.OrderItems.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                ProductId = oi.ProductId,
                ProductName = oi.Product != null ? oi.Product.Name : "Unknown Product",
                ProductImageUrl = oi.Product != null ? oi.Product.ImageUrl : string.Empty,
                Quantity = oi.Quantity,
                Price = oi.Price
            }).ToList()
        };

        return responseDto;
    }
}
