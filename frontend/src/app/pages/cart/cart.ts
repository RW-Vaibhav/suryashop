import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Checkout shipping address form
  shippingAddress = '123 Main St, Apt 4B, New York, NY 10001';
  isCheckingOut = signal(false);

  // Free shipping threshold = ₹999, else flat ₹99.00
  shippingFee = computed(() => {
    const subtotal = this.cartService.cartSubtotal();
    if (subtotal === 0 || subtotal >= 999) {
      return 0;
    }
    return 99;
  });

  orderTotal = computed(() => {
    return this.cartService.cartSubtotal() + this.shippingFee();
  });

  incrementQuantity(item: CartItem) {
    if (item.quantity < item.stockQuantity) {
      const newQty = item.quantity + 1;
      this.cartService.updateQuantity(item.id, newQty).subscribe({
        error: (err) => {
          this.toastService.show(err.error || 'Failed to update quantity', 'error');
        }
      });
    } else {
      this.toastService.show('Cannot exceed available stock limit', 'warning');
    }
  }

  decrementQuantity(item: CartItem) {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.cartService.updateQuantity(item.id, newQty).subscribe({
        error: (err) => {
          this.toastService.show(err.error || 'Failed to update quantity', 'error');
        }
      });
    }
  }

  removeItem(item: CartItem) {
    this.cartService.removeItem(item.id).subscribe({
      next: () => {
        this.toastService.show(`${item.productName} removed from cart`, 'info');
      },
      error: () => {
        this.toastService.show('Failed to remove item', 'error');
      }
    });
  }

  onCheckout() {
    if (this.cartService.cartItems().length === 0) {
      this.toastService.show('Your cart is empty', 'warning');
      return;
    }

    if (!this.shippingAddress.trim()) {
      this.toastService.show('Please enter a shipping address', 'warning');
      return;
    }

    this.isCheckingOut.set(true);

    this.orderService.placeOrder(this.shippingAddress).subscribe({
      next: (order) => {
        this.isCheckingOut.set(false);
        this.toastService.show('Order placed successfully!', 'success');
        this.router.navigate(['/payment-success'], { queryParams: { orderId: order.id } });
      },
      error: (err) => {
        this.isCheckingOut.set(false);
        const errMsg = err.error || 'Checkout failed. Please try again.';
        this.toastService.show(errMsg, 'error');
      }
    });
  }
}
