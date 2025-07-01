import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Assistant } from '../../../models/assistant.model';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-register-assistant',
  imports: [FormsModule, NgIf], // Agregar NgIf aquí
  templateUrl: './register-assistant.component.html',
  styleUrl: './register-assistant.component.css',
})
export class RegisterAssistantComponent {
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  registerAssistant() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const newAssistant = new Assistant(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password
    );

    this.adminService.registerAssistant(newAssistant).subscribe({
      next: (response) => {
        this.successMessage = '¡Asistente registrado exitosamente!';
        this.resetForm();
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/admin-dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = 'Error al registrar asistente: ' + error.message;
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
  }

  backToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
}
