import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // Agregar esta importación
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-physician-dashboard',
  imports: [NgIf], // Agregar NgIf aquí
  templateUrl: './physician-dashboard.component.html',
  styleUrl: './physician-dashboard.component.css'
})
export class PhysicianDashboardComponent implements OnInit {
  currentUser: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      console.log('Usuario médico:', this.currentUser); // Para verificar datos
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }

  // Funciones para los botones del dashboard
  goToSchedule() {
    this.router.navigate(['/physician-schedule']);
  }

  goToPatients() {
    this.router.navigate(['/physician-patients']);
  }

  goToMedicalHistory() {
    this.router.navigate(['/physician-medical-history']);
  }
}