import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  // State
  featuredProducts = signal<Product[]>([]);
  isLoading = signal(true);

  // Categories list
  categories = [
    { name: 'Electronics', count: 5, icon: 'devices', image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60' },
    { name: 'Furniture', count: 2, icon: 'chair', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=500&auto=format&fit=crop&q=60' },
    { name: 'Accessories', count: 1, icon: 'backpack', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60' }
  ];

  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Take first 3 products as featured
        this.featuredProducts.set(products.slice(0, 3));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load featured products', err);
        this.isLoading.set(false);
      }
    });
  }

  selectCategory(categoryName: string) {
    this.router.navigate(['/products'], { queryParams: { category: categoryName } });
  }
}
