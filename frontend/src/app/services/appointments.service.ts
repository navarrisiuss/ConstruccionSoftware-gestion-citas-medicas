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
  getAppointmentsByPatient(patientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/patient/${patientId}`);
  }
  createAppointment(appointment: any): Observable<any> {
    return this.http.post(this.baseUrl, appointment);
  }
  updateAppointment(appointmentId: number, appointment: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${appointmentId}`, appointment);
  }
  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${appointmentId}`);
  }
  getAppointmentById(appointmentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${appointmentId}`);
  }
  getAppointmentsByDate(date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/date/${date}`);
  }
  getAppointmentsByPhysicianAndDate(physicianId: number, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}/date/${date}`);
  }
  getAppointmentsByPatientAndDate(patientId: number, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/patient/${patientId}/date/${date}`);
  }
  getAppointmentsByStatus(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status/${status}`);
  }
  getAppointmentsByPhysicianAndStatus(physicianId: number, status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}/status/${status}`);
  }
  getAppointmentsByPatientAndStatus(patientId: number, status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/patient/${patientId}/status/${status}`);
  }
  getAppointmentsByPhysicianAndPatient(physicianId: number, patientId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}/patient/${patientId}`);
  }
  getAppointmentsByPhysicianPatientAndDate(physicianId: number, patientId: number, date: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}/patient/${patientId}/date/${date}`);
  }
  getAppointmentsByPhysicianPatientAndStatus(physicianId: number, patientId: number, status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/physician/${physicianId}/patient/${patientId}/status/${status}`);
  }
  
}
