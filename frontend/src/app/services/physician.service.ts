import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Physician } from '../models/physician.model';

@Injectable({
  providedIn: 'root',
})
export class PhysicianService {
  private apiUrl = 'http://localhost:3000/api/physicians';

  constructor(private http: HttpClient) {}

  getAllPhysicians(): Observable<Physician[]> {
    return this.http.get<Physician[]>(this.apiUrl);
  }

  getPhysicianById(id: string): Observable<Physician> {
    return this.http.get<Physician>(`${this.apiUrl}/${id}`);
  }

  getPhysiciansBySpecialty(specialty: string): Observable<Physician[]> {
    return this.http.get<Physician[]>(`${this.apiUrl}/specialty/${specialty}`);
  }

  registerPhysician(physician: Physician): Observable<Physician> {
    return this.http.post<Physician>(this.apiUrl, physician);
  }

  updatePhysician(id: string, physician: Physician): Observable<Physician> {
    return this.http.put<Physician>(`${this.apiUrl}/${id}`, physician);
  }

  deletePhysician(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
