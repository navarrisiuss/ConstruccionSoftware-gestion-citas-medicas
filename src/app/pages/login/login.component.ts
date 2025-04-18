import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Admin } from '../../models/admin.model';
import { Physician } from '../../models/physician.model';
import { Assistant } from '../../models/assistant.model';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router, private authService: AuthService) {}

  email: string = '';
  password: string = '';
  message: string = '';

  // Lista de usuarios de ejemplo

  users = [
    new Admin("admin", "admin", "admin", "admin@admin.com", '1234'),
    new Physician("medico", "medico", "medico", "medico@medico.com", '1234', "odontologo"),
    new Assistant("asistente", "asistente", "asistente", "asistente@asistente.com", '1234'),
    new Patient("paciente", "paciente", "paciente", "paciente@paciente.com", '1234'),
  ];

  login() {
    const foundUser = this.users.find(user =>
      user.getEmail() === this.email && user.getPassword() === this.password
    );

    // Si se encuentra un usuario se guarda y redirige a su respectivo dashboard
    if (foundUser) {

      this.authService.setCurrentUser(foundUser);

      if (foundUser instanceof Admin) {
        this.router.navigate(['/admin-dashboard']).then(r => r);
      } else if (foundUser instanceof Physician) {
        this.router.navigate(['/physician-dashboard']).then(r => r);
      } else if (foundUser instanceof Assistant) {
        this.router.navigate(['/assistant-dashboard']).then(r => r);
      } else {
        this.router.navigate(['/patient-dashboard']).then(r => r);
      }
    } else {
      this.message = 'Invalid username or password';
    }
  }

  goToHome() {
    this.router.navigate(['/home']).then(r => r);
  }
}
