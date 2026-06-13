using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure cascade deletes or constraints
        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CartItem>()
            .HasOne(c => c.Product)
            .WithMany()
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.OrderItems)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Seed Products
        modelBuilder.Entity<Product>().HasData(
            new Product
            {
                Id = 1,
                Name = "Premium Noise-Cancelling Headphones",
                Description = "Immerse yourself in pure sound. Featuring advanced active noise cancellation, 40-hour battery life, and ultra-comfortable memory foam earcups.",
                Price = 24999.00m,
                ImageUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60",
                Category = "Electronics",
                StockQuantity = 15,
                Rating = 4.8,
                ReviewsCount = 124
            },
            new Product
            {
                Id = 2,
                Name = "Mechanical Tactile Gaming Keyboard",
                Description = "Elevate your typing and gaming experience with customized tactile switches, anodized aluminum frame, and vibrant per-key RGB backlighting.",
                Price = 12499.00m,
                ImageUrl = "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=60",
                Category = "Electronics",
                StockQuantity = 22,
                Rating = 4.6,
                ReviewsCount = 89
            },
            new Product
            {
                Id = 3,
                Name = "Ultra-Wide 34\" Curved Gaming Monitor",
                Description = "A panoramic viewing experience. 144Hz refresh rate, 1ms response time, HDR10 support, and a sleek near-borderless screen layout.",
                Price = 38999.00m,
                ImageUrl = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60",
                Category = "Electronics",
                StockQuantity = 8,
                Rating = 4.7,
                ReviewsCount = 54
            },
            new Product
            {
                Id = 4,
                Name = "Ergonomic High-Back Executive Chair",
                Description = "Work in comfort. Fully adjustable 3D armrests, dynamic lumbar support, breathable mesh back, and synchro-tilt mechanism.",
                Price = 19999.00m,
                ImageUrl = "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60",
                Category = "Furniture",
                StockQuantity = 12,
                Rating = 4.5,
                ReviewsCount = 67
            },
            new Product
            {
                Id = 5,
                Name = "Minimalist Full-Grain Leather Backpack",
                Description = "Sleek and functional backpack handcrafted from premium leather. Features a padded 16\" laptop sleeve and quick-access utility pockets.",
                Price = 9999.00m,
                ImageUrl = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60",
                Category = "Accessories",
                StockQuantity = 30,
                Rating = 4.4,
                ReviewsCount = 42
            },
            new Product
            {
                Id = 6,
                Name = "Waterproof Active Smartwatch",
                Description = "Track your health and fitness in style. Continuous heart-rate tracking, built-in GPS, sleep monitoring, and up to 7 days of battery life.",
                Price = 14999.00m,
                ImageUrl = "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60",
                Category = "Electronics",
                StockQuantity = 25,
                Rating = 4.3,
                ReviewsCount = 112
            },
            new Product
            {
                Id = 7,
                Name = "Studio Condenser Podcast Microphone",
                Description = "Crystal clear recordings for podcasts, streaming, and voiceovers. Cardioid polar pattern with professional plug-and-play USB connection.",
                Price = 7499.00m,
                ImageUrl = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=60",
                Category = "Electronics",
                StockQuantity = 18,
                Rating = 4.6,
                ReviewsCount = 37
            },
            new Product
            {
                Id = 8,
                Name = "Premium Wool Throw Blanket",
                Description = "Soft, warm, and highly breathable. Woven from 100% organic merino wool. The perfect cozy addition to your living room couch or bed.",
                Price = 5499.00m,
                ImageUrl = "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=500&auto=format&fit=crop&q=60",
                Category = "Furniture",
                StockQuantity = 15,
                Rating = 4.9,
                ReviewsCount = 28
            }
        );
    }
}
