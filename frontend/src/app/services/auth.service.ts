import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null; // Cambiado a 'any'
  private storageKey = 'currentUser'; // Clave para guardar en localStorage

  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:3000/api/auth';// Endpoint

  login(email: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}`); // Usar 'any' aquí también
  }

  // Obtener el usuario actual
  getCurrentUser(): any {
    return this.currentUser;
  }

  // Log out del usuario
  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey); // Eliminamos del localStorage
  }

  // Método para guardar el usuario en localStorage
  setCurrentUser(user: any) { // Cambiar a 'any'
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }
}
