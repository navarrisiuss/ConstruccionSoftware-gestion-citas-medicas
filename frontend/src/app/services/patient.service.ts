import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Patient} from '../models/patient.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/api/patients';

  constructor(private http: HttpClient) {}

  registerPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  //Permitir incluir pacientes inactivos
  getAllPatients(includeInactive: boolean = false): Observable<any[]> {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.http.get<any[]>(`${this.apiUrl}${params}`);
  }

  checkRutExists(rut: string, includeInactive: boolean = false): Observable<any> {
    const params = includeInactive ? `&includeInactive=true` : '';
    return this.http.get<any>(`${this.apiUrl}/check-rut?rut=${rut}${params}`);
  }

  checkEmailExists(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-email?email=${email}`);
  }

  updatePatient(id: string, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  getPatientById(id: string, includeInactive: boolean = false): Observable<any> {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.http.get<any>(`${this.apiUrl}/${id}${params}`);
  }

  //esactivar paciente (soft delete)
  deactivatePatient(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  //Reactivar paciente
  reactivatePatient(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/reactivate`, {});
  }

  //eliminación permanente (solo admin)
  deletePatient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  searchPatientsByEmail(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?email=${email}`);
  }
}