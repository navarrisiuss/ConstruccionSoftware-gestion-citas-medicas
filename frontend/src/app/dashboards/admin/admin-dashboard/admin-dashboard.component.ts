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
    this.router.navigate(['/register-physician'], { 
      queryParams: { from: 'dashboard' } 
    }).then(r => r);
  }

  goToRegisterAssistant() {
    this.router.navigate(['/register-assistant'], { 
      queryParams: { from: 'dashboard' } 
    }).then(r => r);
  }

  // Gestión de pacientes
  goToManagePatients() {
    this.router.navigate(['/admin/manage-patients']);
  }


  // Historiales médicos
  goToMedicalHistory() {
    this.router.navigate(['/medical-history']).then(r => r);
  }

  // Agenda médica
  goToAdvancedAppointmentManager() {
    this.router.navigate(['/admin/appointment-manager']);
  }

  // Reportes
  goToReports() {
    this.router.navigate(['/reports']).then(r => r);
  }

  // Vista de médicos
  goToPhysiciansView() {
    this.router.navigate(['/admin/manage-physicians']);
  }
  
  goToAssistantsView() {
    this.router.navigate(['/admin/manage-assistants']);
  }
}