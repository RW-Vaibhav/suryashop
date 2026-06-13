import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private nextId = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', duration = 3000) {
    const id = this.nextId++;
    const toast: ToastMessage = { id, message, type };
    this.toasts.update(list => [...list, toast]);

    setTimeout(() => {
      this.toasts.update(list => list.filter(t => t.id !== id));
    }, duration);
  }
}
