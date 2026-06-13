using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal ProductPrice { get; set; }
    public string ProductImageUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int StockQuantity { get; set; }
}

public class AddToCartDto
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100.")]
    public int Quantity { get; set; }
}

public class UpdateCartItemDto
{
    [Required]
    [Range(1, 100, ErrorMessage = "Quantity must be between 1 and 100.")]
    public int Quantity { get; set; }
}
