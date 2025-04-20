import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Patient} from '../../../models/patient.model';
import {Gender} from '../../../models/gender.enum';
import {NgIf} from '@angular/common';

import {PatientService} from '../../../services/patient.service';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private router: Router, private patientService: PatientService) {
  }
  patient = new Patient('', '', '', '', '', '', new Date(), '', '', 0);
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  rut: string = '';
  birthDate: string = ''; // En formulario será string, luego se convierte a Date
  phone: string = '';
  address: string = '';
  gender: Gender = Gender.Male; // Valor por defecto

  Gender = Gender; // ¡Importante!

  successMessage: string = '';
  errorMessage: string = '';

  register() {
    this.patient = new Patient(
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

    // Validar campos vacíos
    if (this.validarCamposVacios()) {
      this.errorMessage = 'Todos los campos son obligatorios.';
      this.successMessage = '';
      return;
    }

    // Validar formato de RUT
    if (!this.validarFormatoRut(this.rut)) {
      this.errorMessage = 'Formato de RUT inválido.';
      this.successMessage = '';
      return;
    }

    // Validar formato de correo
    if (!this.validarFormatoEmail(this.email)) {
      this.errorMessage = 'Formato de correo inválido.';
      this.successMessage = '';
      return;
    }

    // Validar fecha de nacimiento
    if (!this.validarFechaNacimiento(this.birthDate)) {
      this.errorMessage = 'La fecha de nacimiento no puede ser mayor a la fecha actual.';
      this.successMessage = '';
      return;
    }

    // Primero, validar si el RUT ya existe
    this.patientService.getPatientByRut(this.rut).subscribe({
      next: (rutPatients) => {
        if (rutPatients.length > 0) {
          // El RUT ya está en uso
          this.errorMessage = 'Este RUT ya está registrado.';
          this.successMessage = '';
        } else {
          // El RUT no existe, ahora validar el email
          this.patientService.getPatientByEmail(this.email).subscribe({
            next: (emailPatients) => {
              if (emailPatients.length > 0) {
                // El correo ya está en uso
                this.errorMessage = 'Este correo ya está registrado.';
                this.successMessage = '';
              } else {
                // Ambos (rut y email) no existen, proceder a registrar
                this.sendHTTPPetition();
                this.successMessage = 'Paciente registrado exitosamente.';
                this.errorMessage = '';
                this.resetForm();
              }
            },
            error: (error) => {
              console.error('Error validando email:', error);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error validando RUT:', error);
      }
    });
  }

  validarFormatoRut(rut: string): boolean {
    // Elimina espacios
    rut = rut.trim();

    // Expresión regular para validar el formato
    const rutRegex = /^(\d{1,2}\.?\d{3}\.?\d{3})\-?([\dkK])$/;

    return rutRegex.test(rut);
  }

  validarFormatoEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  validarCamposVacios(): boolean {
    return !this.name || !this.paternalLastName || !this.maternalLastName ||
           !this.email || !this.password || !this.rut || !this.birthDate ||
           !this.phone || !this.address;
  }

  validarFechaNacimiento(fecha: string): boolean {
    const fechaNacimiento = new Date(fecha);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mes = hoy.getMonth() - fechaNacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      return false; // La fecha de nacimiento es mayor a la fecha actual
    }

    return true; // La fecha de nacimiento es válida
  }

  sendHTTPPetition() {
    this.patientService.registerPatient(this.patient).subscribe({
      next: (response) => {
        console.log('Paciente registrado exitosamente:', response);
      },
      error: (error) => {
        console.error('Error al registrar paciente:', error);
      }
    });
  }

  resetForm() {
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
  }

  backToHome() {
    this.router.navigate(['/home']).then(r => r);
  }
}
