import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private apiUrl = 'http://localhost:3000/api/appointments';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el usuario actual desde localStorage
   */
  private getCurrentUser(): any {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error al parsear currentUser:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Obtener todas las citas del paciente autenticado
   */
  getAppointmentsForLoggedInPatient(): Observable<any[]> {
    const user = this.getCurrentUser();
    if (user && user.id) {
      return this.http.get<any[]>(`${this.apiUrl}/patient/${user.id}`);
    } else {
      console.warn('No hay paciente logueado');
      return of([]); // Retorna observable vacío si no hay usuario
    }
  }
}
