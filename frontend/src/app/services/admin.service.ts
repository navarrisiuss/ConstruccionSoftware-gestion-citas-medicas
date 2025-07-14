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
            // 👇 LÍNEA CORREGIDA
            fullName: [p.name, p.paternalLastName, p.maternalLastName].filter(Boolean).join(' ')
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

  getAppointmentsByPatient(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointments/patient/${patientId}`);
  }

  //Crear una cita
  createAppointment(appointment: any): Observable<any> {
    console.log('AdminService: enviando cita al servidor:', appointment);
    return this.http.post<any>(`${this.apiUrl}/appointments`, appointment);
  }
  updateAppointmentStatus(appointmentId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/status`, { status });
  }

  updateAppointment(appointmentId: number, appointmentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}`, appointmentData);
  }

  updateAppointmentNotes(appointmentId: number, notesData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/notes`, notesData);
  }
  //Metodo para eliminar una cita
  deleteAppointment(appointmentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`);
  }

  //Metodo para obtener todas las especialidades de un medico
  getAllSpecialties(physicianId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/physicians/${physicianId}/specialties`);
  }
  
  // ✅ Cancelar cita con detalles
  cancelAppointment(appointmentId: number, cancelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointments/${appointmentId}/cancel`, cancelData);
  }

  // Reportes
  generateReport(reportType: string, dateRange?: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reports`, { type: reportType, dateRange });
  }

  generateAppointmentsReport(filters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/appointments`, filters);
  }

  generatePhysiciansReport(filters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/physicians`, filters);
  }

  generatePatientsReport(filters: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/patients`, filters);
  }

  saveReport(reportData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reports/save`, reportData);
  }

  getReportHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/history`);
  }

  getGeneralStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/statistics`);
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
