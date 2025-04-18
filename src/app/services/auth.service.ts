import { Injectable } from '@angular/core';
import { Person } from '../models/person.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: Person | null = null;
  private storageKey = 'currentUser'; // clave para guardar en localStorage

  constructor() {
    // Al cargar el servicio, intenta leer del localStorage
    const savedUser = localStorage.getItem(this.storageKey);
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  setCurrentUser(user: Person) {
    this.currentUser = user;
    localStorage.setItem(this.storageKey, JSON.stringify(user)); // Guardamos en localStorage
  }

  getCurrentUser(): Person | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem(this.storageKey); // Eliminamos del localStorage
  }
}
