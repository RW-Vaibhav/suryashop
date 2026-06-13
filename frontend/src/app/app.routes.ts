import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/product-list/product-list').then(m => m.ProductListComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then(m => m.CartComponent),
    canActivate: [authGuard]
  },
  {
    path: 'payment-success',
    loadComponent: () => import('./pages/payment-done/payment-done').then(m => m.PaymentDoneComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
