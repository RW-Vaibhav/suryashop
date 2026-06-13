using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    public User? User { get; set; }
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Completed
    
    public List<OrderItem> OrderItems { get; set; } = new();
}
