import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Patient } from '../../../models/patient.model';
import { Gender } from '../../../models/gender.enum';
import { PatientService } from '../../../services/patient.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-patient',
  imports: [FormsModule, CommonModule],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css',
})
export class RegisterPatientComponent {
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  rut: string = '';
  birthDate: string = '';
  phone: string = '';
  address: string = '';
  gender: Gender = Gender.Male;

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  genders = [
    { value: Gender.Male, label: 'Masculino' },
    { value: Gender.Female, label: 'Femenino' },
  ];

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  registerPatient(): void {
    if (!this.validateForm()) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    const patient = new Patient(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password,
      this.rut,
      new Date(this.birthDate),
      this.phone,
      this.address,
      this.gender
    );

    this.patientService.registerPatient(patient).subscribe({
      next: (response) => {
        this.successMessage = '¡Paciente registrado exitosamente!';
        this.isLoading = false;
        // Don't reset form immediately - let the success message be visible
        setTimeout(() => {
          this.resetForm();
          this.router.navigate(['/assistant-dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = `Error al registrar paciente: ${error.message || 'Error del servidor'}`;
        this.isLoading = false;
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

    if (!this.rut.trim()) {
      this.errorMessage = 'El RUT es requerido';
      return false;
    }

    if (!this.birthDate) {
      this.errorMessage = 'La fecha de nacimiento es requerida';
      return false;
    }

    if (!this.phone.trim()) {
      this.errorMessage = 'El teléfono es requerido';
      return false;
    }

    if (!this.address.trim()) {
      this.errorMessage = 'La dirección es requerida';
      return false;
    }

    const today = new Date();
    const birth = new Date(this.birthDate);
    if (birth >= today) {
      this.errorMessage = 'La fecha de nacimiento debe ser anterior a hoy';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm(): void {
    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.rut = '';
    this.birthDate = '';
    this.phone = '';
    this.address = '';
    this.gender = Gender.Male;
    this.errorMessage = '';
    this.successMessage = '';
  }

  backToDashboard(): void {
    this.router.navigate(['/assistant-dashboard']);
  }
}
