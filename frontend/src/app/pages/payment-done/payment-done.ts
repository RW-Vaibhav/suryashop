import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService, Order } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-payment-done',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './payment-done.html',
  styleUrl: './payment-done.css'
})
export class PaymentDoneComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // States
  order = signal<Order | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const orderIdParam = params['orderId'];
      if (orderIdParam) {
        const orderId = +orderIdParam;
        this.loadOrderReceipt(orderId);
      } else {
        this.toastService.show('No order reference found', 'error');
        this.router.navigate(['/']);
      }
    });
  }

  loadOrderReceipt(orderId: number) {
    this.isLoading.set(true);
    this.orderService.getOrderById(orderId).subscribe({
      next: (receipt) => {
        this.order.set(receipt);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load order receipt', err);
        this.toastService.show('Failed to load order details', 'error');
        this.isLoading.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
