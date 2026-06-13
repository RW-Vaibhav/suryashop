import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  // Component state
  isLoginMode = signal(true);
  isLoading = signal(false);
  isForgotPasswordMode = signal(false);

  // Form bindings
  username = '';
  email = '';
  password = '';

  private returnUrl = '/';

  constructor() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/');
    }
  }

  toggleMode() {
    this.isLoginMode.update(mode => !mode);
    this.isForgotPasswordMode.set(false);
    this.clearForm();
  }

  toggleForgotPassword(state: boolean) {
    this.isForgotPasswordMode.set(state);
    this.clearForm();
  }

  onResetPassword() {
    if (!this.email || !this.password) {
      this.toastService.show('Please enter both email and new password', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.show('Password must be at least 6 characters long', 'warning');
      return;
    }

    this.isLoading.set(true);

    this.authService.resetPassword(this.email, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.show('Password reset successfully! You can now log in.', 'success');
        this.toggleForgotPassword(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error || 'Password reset failed. Please try again.';
        this.toastService.show(errMsg, 'error');
      }
    });
  }

  onSubmit() {
    if (!this.email || !this.password || (!this.isLoginMode() && !this.username)) {
      this.toastService.show('Please fill in all fields', 'warning');
      return;
    }

    if (this.password.length < 6) {
      this.toastService.show('Password must be at least 6 characters long', 'warning');
      return;
    }

    this.isLoading.set(true);

    if (this.isLoginMode()) {
      this.authService.login(this.email, this.password).subscribe({
        next: (user) => {
          this.isLoading.set(false);
          this.toastService.show(`Welcome back, ${user.username}!`, 'success');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errMsg = err.error || 'Invalid credentials. Please try again.';
          this.toastService.show(errMsg, 'error');
        }
      });
    } else {
      this.authService.register(this.username, this.email, this.password).subscribe({
        next: (user) => {
          this.isLoading.set(false);
          this.toastService.show('Account created successfully!', 'success');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err) => {
          this.isLoading.set(false);
          const errMsg = err.error || 'Registration failed. Please try again.';
          this.toastService.show(errMsg, 'error');
        }
      });
    }
  }

  private clearForm() {
    this.username = '';
    this.email = '';
    this.password = '';
  }
}
