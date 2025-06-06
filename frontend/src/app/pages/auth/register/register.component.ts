import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Patient } from '../../../models/patient.model';
import { Gender } from '../../../models/gender.enum';
import { NgIf } from '@angular/common';

import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, NgIf],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  constructor(
    private router: Router,
    private patientService: PatientService
  ) {}
  patient = new Patient('', '', '', '', '', '', new Date(), '', '', 0);
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

  Gender = Gender;

  successMessage: string = '';

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
    this.sendHTTPPetition();
    this.resetForm();
  }

  sendHTTPPetition() {
    this.patientService.registerPatient(this.patient).subscribe({
      next: (response) => {
        console.log('Paciente registrado exitosamente:', response);
      },
      error: (error) => {
        console.error('Error registrando paciente:', error);
      },
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
    this.router.navigate(['/home']).then((r) => r);
  }
}
