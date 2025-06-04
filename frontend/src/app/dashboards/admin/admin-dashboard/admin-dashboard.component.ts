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
    if (user instanceof Admin) {
      this.currentUser = user;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }

  goToRegisterPhysician() {
    this.router.navigate(['/register-physician']).then(r => r);
  }
}
