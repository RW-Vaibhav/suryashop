import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
  stockQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:5179/api/cart';

  cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().reduce((acc, item) => acc + item.quantity, 0));
  cartSubtotal = computed(() => this.cartItems().reduce((acc, item) => acc + (item.productPrice * item.quantity), 0));

  constructor() {
    // Automatically load cart when authenticated, and clear when logged out
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.loadCart().subscribe({
          error: (err) => console.error('Failed to load cart', err)
        });
      } else {
        this.cartItems.set([]);
      }
    });
  }

  loadCart(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl).pipe(
      tap(items => this.cartItems.set(items))
    );
  }

  addToCart(productId: number, quantity: number): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, { productId, quantity }).pipe(
      tap(() => this.loadCart().subscribe())
    );
  }

  updateQuantity(id: number, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { quantity }).pipe(
      tap(() => {
        // Optimistic update for instant responsiveness
        this.cartItems.update(items => 
          items.map(item => item.id === id ? { ...item, quantity } : item)
        );
      })
    );
  }

  removeItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        // Optimistic update
        this.cartItems.update(items => items.filter(item => item.id !== id));
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear`).pipe(
      tap(() => this.cartItems.set([]))
    );
  }
}
