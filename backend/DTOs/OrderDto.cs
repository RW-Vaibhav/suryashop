using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class PlaceOrderDto
{
    [Required]
    [MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductImageUrl { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string ShippingAddress { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<OrderItemDto> OrderItems { get; set; } = new();
}
