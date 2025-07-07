import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;
  private storageKey = 'currentUser';

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage al inicializar
    const storedUser = localStorage.getItem(this.storageKey);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }
  }

  private apiUrl = 'http://localhost:3000/api/auth';

  login(email: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`);
  }

  // En auth.service.ts
getCurrentUser(): any {
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  }
  return null;
}

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  getUserRole(): string {
    if (!this.currentUser) return '';

    if (this.currentUser.role === 'admin' || this.currentUser.email?.includes('@admin.')) {
      return 'admin';
    }

    if (this.currentUser.specialty) {
      return 'physician';
    }

    if (this.currentUser.role === 'assistant') {
      return 'assistant';
    }

    return 'patient';
  }
}
