import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: any = null;
  private storageKey = 'currentUser';

  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:3000/api/auth';

  login(email: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`);
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey);
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}
