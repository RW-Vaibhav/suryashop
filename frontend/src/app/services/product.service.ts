import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  rating: number;
  reviewsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5179/api/product';

  getProducts(search?: string, category?: string, sortBy?: string): Observable<Product[]> {
    let params = new HttpParams();
    
    if (search) {
      params = params.set('search', search);
    }
    if (category) {
      params = params.set('category', category);
    }
    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}
