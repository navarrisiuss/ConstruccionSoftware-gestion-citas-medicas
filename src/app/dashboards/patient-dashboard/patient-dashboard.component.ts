import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {Patient} from '../../models/patient.model';

@Component({
  selector: 'app-patient-dashboard',
  imports: [],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.css'
})
export class PatientDashboardComponent implements OnInit {
  currentUser!: Patient | null;

  constructor(private router: Router, private authService: AuthService) {
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user instanceof Patient) {
      this.currentUser = user;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }
}
