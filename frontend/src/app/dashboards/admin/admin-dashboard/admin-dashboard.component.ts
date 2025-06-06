import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/auth.service';
import {Admin} from '../../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  currentUser!: Admin | null;

  constructor(private router: Router, private authService: AuthService) {
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      // Crear instancia de Admin con los datos del usuario
      this.currentUser = new Admin(
        user.name || 'Admin',
        user.paternalLastName || '',
        user.maternalLastName || '',
        user.email,
        user.password
      );
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }

  // Gestión de personal médico
  goToRegisterPhysician() {
    this.router.navigate(['/register-physician']).then(r => r);
  }

  goToRegisterAssistant() {
    this.router.navigate(['/register-assistant']).then(r => r);
  }

  // Gestión de pacientes
  goToManagePatients() {
    this.router.navigate(['/manage-patients']).then(r => r);
  }

  // Gestión de citas
  goToManageAppointments() {
    this.router.navigate(['/manage-appointments']).then(r => r);
  }

  // Historiales médicos
  goToMedicalHistory() {
    this.router.navigate(['/medical-history']).then(r => r);
  }

  // Agenda médica
  goToMedicalSchedule() {
    this.router.navigate(['/medical-schedule']).then(r => r);
  }

  // Reportes
  goToReports() {
    this.router.navigate(['/reports']).then(r => r);
  }

  // Vista de médicos
  goToPhysiciansView() {
    this.router.navigate(['/physicians-view']).then(r => r);
  }

  // Vista de asistentes
  goToAssistantsView() {
    this.router.navigate(['/assistants-view']).then(r => r);
  }
}