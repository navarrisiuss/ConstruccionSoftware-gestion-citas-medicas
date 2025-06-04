import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Assistant } from '../../../models/assistant.model';

@Component({
  selector: 'app-assistant-dashboard',
  imports: [],
  templateUrl: './assistant-dashboard.component.html',
  styleUrl: './assistant-dashboard.component.css'
})
export class AssistantDashboardComponent implements OnInit {
  currentUser!: Assistant | null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user instanceof Assistant) {
      this.currentUser = user;
    }
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }

  goToRegisterPatient() {
    this.router.navigate(['/register-patient']).then(r => r);
  }
}
