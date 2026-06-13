import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  username: string;
  email: string;
  role: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5179/api/auth';

  // State managed via signals
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor() {
    this.loadUser();
  }

  private loadUser() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUser.set(user);
        
        // Quietly verify JWT token freshness on load
        this.getCurrentUser().subscribe({
          next: (u) => {
            this.currentUser.set(u);
            localStorage.setItem('user', JSON.stringify(u));
          },
          error: () => this.logout()
        });
      } catch (e) {
        this.logout();
      }
    }
  }

  register(username: string, email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, { username, email, password }).pipe(
      tap(user => this.handleAuth(user))
    );
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(user => this.handleAuth(user))
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  private handleAuth(user: User) {
    if (user.token) {
      localStorage.setItem('token', user.token);
    }
    const userCopy = { ...user };
    delete userCopy.token;
    localStorage.setItem('user', JSON.stringify(userCopy));
    this.currentUser.set(userCopy);
  }
}
