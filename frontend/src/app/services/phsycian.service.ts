import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Physician } from '../models/physician.model';

@Injectable({
  providedIn: 'root'
})
export class PhysicianService {
  private apiUrl = 'http://localhost:3000/api/physicians';

  constructor(private http: HttpClient) {}

  // Registrar nuevo médico
  registerPhysician(physician: Physician): Observable<Physician> {
    return this.http.post<Physician>(this.apiUrl, physician);
  }

  // Obtener todos los médicos
  getAllPhysicians(): Observable<Physician[]> {
    return this.http.get<Physician[]>(this.apiUrl);
  }

  // Obtener médico por ID
  getPhysicianById(id: string): Observable<Physician> {
    return this.http.get<Physician>(`${this.apiUrl}/${id}`);
  }

  // Actualizar médico
  updatePhysician(id: string, physician: Partial<Physician>): Observable<Physician> {
    return this.http.put<Physician>(`${this.apiUrl}/${id}`, physician);
  }

  // Eliminar médico
  deletePhysician(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Buscar médicos por especialidad
  getPhysiciansBySpecialty(specialty: string): Observable<Physician[]> {
    return this.http.get<Physician[]>(`${this.apiUrl}/specialty/${specialty}`);
  }
}