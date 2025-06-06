import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // Agregar NgIf
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-assistant-dashboard', // Agregar NgIf aquí
  templateUrl: './assistant-dashboard.component.html',
  styleUrl: './assistant-dashboard.component.css',
})
export class AssistantDashboardComponent implements OnInit {
  currentUser: any = null; // Cambiar a any para que funcione con datos del backend

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      console.log('Usuario asistente:', this.currentUser); // Para verificar datos
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then((r) => r);
  }

  // Funciones para gestión de pacientes
  goToRegisterPatient() {
    this.router.navigate(['/register-patient']).then((r) => r);
  }

  goToManagePatients() {
    this.router.navigate(['/assistant-manage-patients']).then(r => r);
  }

  // Funciones para gestión de citas
  goToManageAppointments() {
    this.router.navigate(['/assistant-manage-appointments']).then(r => r);
  }

  goToScheduleAppointment() {
    this.router.navigate(['/assistant-schedule-appointment']).then(r => r);
  }
}