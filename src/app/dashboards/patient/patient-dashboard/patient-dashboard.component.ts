import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  currentUser: any = null; // Cambiar a 'any'

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser(); // Obtener el usuario del servicio
  }

  goToNewAppointment(): void {
    this.router.navigate(['/appointment-form']); // Navegar al formulario de nueva cita
  }

  logout(): void {
    this.authService.logout(); // Eliminar el usuario de la sesión
    this.router.navigate(['/home']); // Navegar a la página de inicio o login
  }
}
