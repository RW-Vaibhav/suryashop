import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);

  // States
  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  selectedCategory = signal<string>('');
  searchQuery = signal<string>('');
  sortBy = signal<string>('default');
  isLoading = signal(true);

  // Input model binding
  searchText = '';

  ngOnInit() {
    // Load categories first
    this.productService.getCategories().subscribe({
      next: (cats) => this.categories.set(cats),
      error: (err) => console.error('Failed to load categories', err)
    });

    // Subscribe to query parameters to handle homepage redirects
    this.route.queryParams.subscribe(params => {
      const catParam = params['category'] || '';
      const searchParam = params['search'] || '';
      
      this.selectedCategory.set(catParam);
      this.searchQuery.set(searchParam);
      this.searchText = searchParam;
      
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading.set(true);
    
    this.productService.getProducts(
      this.searchQuery(),
      this.selectedCategory(),
      this.sortBy()
    ).subscribe({
      next: (prods) => {
        this.products.set(prods);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.isLoading.set(false);
      }
    });
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
    this.loadProducts();
  }

  onSearchSubmit() {
    this.searchQuery.set(this.searchText);
    this.loadProducts();
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.sortBy.set(value);
    this.loadProducts();
  }

  resetFilters() {
    this.selectedCategory.set('');
    this.searchQuery.set('');
    this.searchText = '';
    this.sortBy.set('default');
    this.loadProducts();
  }
}
