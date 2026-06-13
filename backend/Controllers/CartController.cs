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
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CartItemDto>>> GetCart()
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var items = await _context.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Product)
            .Select(c => new CartItemDto
            {
                Id = c.Id,
                ProductId = c.ProductId,
                ProductName = c.Product != null ? c.Product.Name : "Unknown Product",
                ProductPrice = c.Product != null ? c.Product.Price : 0,
                ProductImageUrl = c.Product != null ? c.Product.ImageUrl : string.Empty,
                Quantity = c.Quantity,
                StockQuantity = c.Product != null ? c.Product.StockQuantity : 0
            })
            .ToListAsync();

        return items;
    }

    [HttpPost]
    public async Task<ActionResult<CartItemDto>> AddToCart(AddToCartDto dto)
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
        {
            return NotFound("Product not found.");
        }

        if (product.StockQuantity < dto.Quantity)
        {
            return BadRequest($"Only {product.StockQuantity} item(s) are left in stock.");
        }

        var cartItem = await _context.CartItems
            .SingleOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

        if (cartItem == null)
        {
            cartItem = new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
            _context.CartItems.Add(cartItem);
        }
        else
        {
            var newQuantity = cartItem.Quantity + dto.Quantity;
            if (product.StockQuantity < newQuantity)
            {
                return BadRequest($"Cannot add more. Total in cart ({newQuantity}) exceeds stock ({product.StockQuantity}).");
            }
            cartItem.Quantity = newQuantity;
        }

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCart), new { }, new CartItemDto
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            ProductName = product.Name,
            ProductPrice = product.Price,
            ProductImageUrl = product.ImageUrl,
            Quantity = cartItem.Quantity,
            StockQuantity = product.StockQuantity
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateQuantity(int id, UpdateCartItemDto dto)
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var cartItem = await _context.CartItems
            .Include(c => c.Product)
            .SingleOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound("Cart item not found.");
        }

        if (cartItem.Product != null && cartItem.Product.StockQuantity < dto.Quantity)
        {
            return BadRequest($"Only {cartItem.Product.StockQuantity} item(s) are left in stock.");
        }

        cartItem.Quantity = dto.Quantity;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var cartItem = await _context.CartItems
            .SingleOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (cartItem == null)
        {
            return NotFound("Cart item not found.");
        }

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        int userId;
        try { userId = GetUserId(); }
        catch (UnauthorizedAccessException) { return Unauthorized(); }

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .ToListAsync();

        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
