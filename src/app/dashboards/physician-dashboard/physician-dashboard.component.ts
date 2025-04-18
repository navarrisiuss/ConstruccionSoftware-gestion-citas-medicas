import { Component, OnInit } from '@angular/core';
import {Physician} from '../../models/physician.model';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-physician-dashboard',
  imports: [],
  templateUrl: './physician-dashboard.component.html',
  styleUrl: './physician-dashboard.component.css'
})
export class PhysicianDashboardComponent implements OnInit {
  currentUser!: Physician | null;

  constructor(private router: Router, private authService: AuthService) {
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user instanceof Physician) {
      this.currentUser = user;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']).then(r => r);
  }
}
