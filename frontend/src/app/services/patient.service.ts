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

  // Nuevo método para obtener todos los pacientes
  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Método para verificar RUT
  checkRutExists(rut: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/check-rut?rut=${rut}`);
  }

  // Método para actualizar paciente
  updatePatient(id: string, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  // Método para obtener paciente por ID
  getPatientById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Método para eliminar paciente (para implementar después)
  deletePatient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}