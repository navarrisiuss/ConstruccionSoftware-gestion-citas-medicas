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
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        if (response.length > 0) {
          const usuario: any = response[0]; // Cambiado a 'any'

          if (usuario.password === this.password) {
            console.log('Usuario autenticado:', usuario);
            this.message = 'Login exitoso!';
            this.authService.setCurrentUser(usuario); // Guardar usuario con 'any'
            this.router.navigate(['patient-dashboard']);
          } else {
            this.message = 'Contraseña incorrecta.';
          }
        } else {
          this.message = 'Email no encontrado.';
        }
      },
      (error) => {
        console.error(error);
        this.message = 'Error en el servidor.';
      }
    );
  }

  goToRegister() {
    this.router.navigate(['/register']).then((r) => r);
  }

  goToHome() {
    this.router.navigate(['/home']).then((r) => r);
  }
}
