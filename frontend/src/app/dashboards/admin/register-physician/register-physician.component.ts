import { Component } from '@angular/core';
import { Physician } from '../../../models/physician.model';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-physician',
  imports: [FormsModule, NgIf],
  templateUrl: './register-physician.component.html',
  styleUrl: './register-physician.component.css',
})
export class RegisterPhysicianComponent {
  constructor(private router: Router) {}

  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  specialty: string = '';

  successMessage: string = '';

  registerPhysician() {
    const newPhysician = new Physician(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password,
      this.specialty
    );

    const physicians = JSON.parse(localStorage.getItem('physicians') || '[]');
    physicians.push(newPhysician);
    localStorage.setItem('physicians', JSON.stringify(physicians));

    this.successMessage = '¡Médico registrado exitosamente!';
    console.table(newPhysician);

    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.specialty = '';
  }

  backToDashboard() {
    this.router.navigate(['/admin-dashboard']).then((r) => r);
  }
}
