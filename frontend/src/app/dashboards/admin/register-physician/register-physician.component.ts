import { Component } from '@angular/core';
import { Physician } from '../../../models/physician.model';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common'; // Añadir NgFor aquí
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-register-physician',
  imports: [FormsModule, NgIf, NgFor], // Añadir NgFor en los imports
  templateUrl: './register-physician.component.html',
  styleUrl: './register-physician.component.css',
})
export class RegisterPhysicianComponent {
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  specialty: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  // Lista de especialidades predefinidas
  specialties = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Ginecología',
    'Neurología',
    'Oftalmología',
    'Ortopedia',
    'Pediatría',
    'Psiquiatría',
    'Radiología',
    'Urología',
    'Medicina General',
  ];

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  registerPhysician() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const newPhysician = new Physician(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password,
      this.specialty
    );

    // Usar el servicio para registrar en el backend
    this.adminService.registerPhysician(newPhysician).subscribe({
      next: (response) => {
        this.successMessage = '¡Médico registrado exitosamente!';
        console.log('Médico registrado:', response);
        this.resetForm();
        this.isLoading = false;

        // Opcional: redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/admin-dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Error al registrar médico: ' + error.message;
        this.isLoading = false;
        console.error('Error:', error);
      },
    });
  }

  validateForm(): boolean {
    if (!this.name.trim()) {
      this.errorMessage = 'El nombre es requerido';
      return false;
    }
    if (!this.paternalLastName.trim()) {
      this.errorMessage = 'El apellido paterno es requerido';
      return false;
    }
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      this.errorMessage = 'Email válido es requerido';
      return false;
    }
    if (!this.password || this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return false;
    }
    if (!this.specialty.trim()) {
      this.errorMessage = 'La especialidad es requerida';
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm() {
    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.specialty = '';
    this.errorMessage = '';
  }

  backToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
}
