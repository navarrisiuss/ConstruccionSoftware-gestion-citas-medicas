import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appointment-form',
  imports: [],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css',
})
export class AppointmentFormComponent {
  constructor(private router: Router) {}

  goToPatientDashboard() {
    this.router.navigate(['/patient-dashboard']).then((r) => r);
  }
}
