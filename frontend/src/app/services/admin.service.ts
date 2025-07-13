import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Physician } from '../models/physician.model';
import { Assistant } from '../models/assistant.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Gestión de médicos
  registerPhysician(physician: Physician): Observable<Physician> {
    return this.http.post<Physician>(`${this.apiUrl}/physicians`, physician);
  }

  getAllPhysicians(): Observable<Physician[]> {
    return this.http.get<Physician[]>(`${this.apiUrl}/physicians`);
  }

  getPhysiciansForSelect(): Observable<{ id: number; fullName: string }[]> {
       return this.http.get<any[]>(`${this.apiUrl}/physicians`)
         .pipe(
           map((list: any[]) =>
             list.map(p => ({
               id: p.id,
               fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`
             }))
           )
         );
    }

  // Gestión de asistentes
  registerAssistant(assistant: Assistant): Observable<Assistant> {
    return this.http.post<Assistant>(`${this.apiUrl}/assistants`, assistant);
  }

  getAllAssistants(): Observable<Assistant[]> {
    return this.http.get<Assistant[]>(`${this.apiUrl}/assistants`);
  }

  // Gestión de pacientes
  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patients`);
  }

  // Gestión de citas
  getAllAppointments(): Observable<any[]> {
    console.log('AdminService: obteniendo todas las citas');
    return this.http.get<any[]>(`${this.apiUrl}/appointments`);
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointments`, appointment);
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/appointments/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${id}`);
  }

  // Reportes
  generateReport(reportType: string, dateRange?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reports`, {
      type: reportType,
      dateRange,
    });
  }

  // Historiales médicos
  getMedicalHistory(patientId?: string): Observable<any[]> {
    const url = patientId
      ? `${this.apiUrl}/medical-history?patientId=${patientId}`
      : `${this.apiUrl}/medical-history`;
    return this.http.get<any[]>(url);
  }
}
