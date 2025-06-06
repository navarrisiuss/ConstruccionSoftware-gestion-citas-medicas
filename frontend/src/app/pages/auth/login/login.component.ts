import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  message: string = '';

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any[]) => {
        if (response.length > 0) {
          const usuario: any = response[0];

          if (usuario.password === this.password) {
            this.message = 'Login exitoso!';
            this.authService.setCurrentUser(usuario);
            
            // Redirigir según el rol del usuario
            const userRole = this.authService.getUserRole();
            switch(userRole) {
              case 'admin':
                this.router.navigate(['/admin-dashboard']);
                break;
              case 'physician':
                this.router.navigate(['/physician-dashboard']);
                break;
              case 'assistant':
                this.router.navigate(['/assistant-dashboard']);
                break;
              default:
                this.router.navigate(['/patient-dashboard']);
            }
          } else {
            this.message = 'Contraseña incorrecta.';
          }
        } else {
          this.message = 'Email no encontrado.';
        }
      },
      error: (error: any) => {
        console.error(error);
        this.message = 'Error en el servidor.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']).then((r) => r);
  }

  goToHome() {
    this.router.navigate(['/home']).then((r) => r);
  }
}