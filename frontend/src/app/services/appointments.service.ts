import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private baseUrl = 'http://localhost:3000/api/appointments'; // Cambia si tu backend tiene otra ruta base

  constructor(private http: HttpClient) {}

  getAppointmentsByPhysician(physicianId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}`);
  }

  getAllAppointments(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}
