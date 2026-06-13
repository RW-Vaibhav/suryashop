import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // States
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  quantity = signal<number>(1);
  isLoading = signal(true);
  isAddingToCart = signal(false);

  ngOnInit() {
    // Listen to route changes to update details if user clicks a related product
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        const id = +idParam;
        this.loadProductDetails(id);
      }
    });
  }

  loadProductDetails(id: number) {
    this.isLoading.set(true);
    this.quantity.set(1); // Reset qty on product change

    this.productService.getProduct(id).subscribe({
      next: (prod) => {
        this.product.set(prod);
        this.loadRelatedProducts(prod);
      },
      error: (err) => {
        console.error('Failed to load product details', err);
        this.toastService.show('Product not found', 'error');
        this.router.navigate(['/products']);
      }
    });
  }

  loadRelatedProducts(currentProduct: Product) {
    this.productService.getProducts('', currentProduct.category).subscribe({
      next: (prods) => {
        // Exclude current product and take at most 3
        const related = prods
          .filter(p => p.id !== currentProduct.id)
          .slice(0, 3);
        this.relatedProducts.set(related);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load related products', err);
        this.isLoading.set(false);
      }
    });
  }

  incrementQty() {
    const prod = this.product();
    if (prod && this.quantity() < prod.stockQuantity) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    const prod = this.product();
    if (!prod) return;

    if (!this.authService.isAuthenticated()) {
      this.toastService.show('Please login to add items to cart', 'info');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/product/${prod.id}` } });
      return;
    }

    if (prod.stockQuantity < this.quantity()) {
      this.toastService.show('Insufficient stock available', 'error');
      return;
    }

    this.isAddingToCart.set(true);
    this.cartService.addToCart(prod.id, this.quantity()).subscribe({
      next: () => {
        this.isAddingToCart.set(false);
        this.toastService.show(`${this.quantity()}x ${prod.name} added to cart!`, 'success');
      },
      error: (err) => {
        this.isAddingToCart.set(false);
        const errMsg = err.error || 'Failed to add item to cart. Please try again.';
        this.toastService.show(errMsg, 'error');
      }
    });
  }
}
