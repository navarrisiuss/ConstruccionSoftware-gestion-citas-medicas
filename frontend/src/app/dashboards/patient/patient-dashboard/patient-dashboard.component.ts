import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // Agregar NgIf
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
  currentUser: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      console.log('Usuario paciente:', this.currentUser); // Para verificar datos
    }
  }

  goToNewAppointment(): void {
    this.router.navigate(['/appointment-form']);
  }

  goToAppointmentHistory(): void {
    this.router.navigate(['/patient-appointment-history']);
  }

  goToHelpChat(): void {
    this.router.navigate(['/patient-help-chat']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}