import { Component } from '@angular/core';
import {Physician} from '../../../../models/physician.model';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-register-physician',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register-physician.component.html',
  styleUrl: './register-physician.component.css'
})
export class RegisterPhysicianComponent {
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

    // Guardar en localStorage
    const physicians = JSON.parse(localStorage.getItem('physicians') || '[]');
    physicians.push(newPhysician);
    localStorage.setItem('physicians', JSON.stringify(physicians));

    // Mostrar mensaje
    this.successMessage = '¡Médico registrado exitosamente!';
    console.table(newPhysician)

    // Limpiar formulario
    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.specialty = '';
  }
}
