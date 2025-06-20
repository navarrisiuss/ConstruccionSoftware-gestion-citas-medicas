import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin.model';
import { Physician } from '../models/physician.model';
import { Assistant } from '../models/assistant.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
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
    return this.http.get<any[]>(`${this.apiUrl}/appointments`);
  }

  //Crear una cita
  createAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/appointments`, appointment);
  }

  // Reportes
  generateReport(reportType: string, dateRange?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reports`, { type: reportType, dateRange });
  }

  // Historiales médicos
  getMedicalHistory(patientId?: string): Observable<any[]> {
    const url = patientId ?
      `${this.apiUrl}/medical-history?patientId=${patientId}` :
      `${this.apiUrl}/medical-history`;
    return this.http.get<any[]>(url);
  }

  updateAssistant(id: number, assistantData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/assistants/${id}`, assistantData);
  }

  getAssistantByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assistants/email?email=${email}`);
  }
  updatePhysician(id: number, physicianData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/physicians/${id}`, physicianData);
  }

  getPhysicianByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/physicians/email?email=${email}`);
  }

  getAdminByEmail(email: string): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.apiUrl}/admins/email?email=${email}`);
  }

  getPatientByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/patients/email?email=${email}`);
  }
}
