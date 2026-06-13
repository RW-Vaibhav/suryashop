using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = string.Empty;
    
    [Required]
    public int StockQuantity { get; set; }
    
    public double Rating { get; set; } = 4.5;
    
    public int ReviewsCount { get; set; } = 0;
}
