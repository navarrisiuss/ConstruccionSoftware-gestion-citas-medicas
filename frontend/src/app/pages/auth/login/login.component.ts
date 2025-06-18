import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import {NgIf} from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  isLoading: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  login() {
    // Validaciones básicas
    if (!this.email || !this.password) {
      Swal.fire({
        title: 'Campos Incompletos',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#096775',
        background: '#ffffff',
        color: '#096775'
      });
      return;
    }

    // Validar formato de email
    if (!this.isValidEmail(this.email)) {
      Swal.fire({
        title: 'Email Inválido',
        text: 'Por favor, ingresa un email válido.',
        icon: 'error',
        confirmButtonText: 'Corregir',
        confirmButtonColor: '#096775',
        background: '#ffffff',
        color: '#096775'
      });
      return;
    }

    this.isLoading = true;

    // Mostrar loading
    Swal.fire({
      title: 'Iniciando Sesión...',
      text: 'Por favor espera mientras verificamos tus credenciales',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      background: '#ffffff',
      color: '#096775',
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.authService.login(this.email, this.password).subscribe({
      next: (response: any[]) => {
        this.isLoading = false;
        
        if (response.length > 0) {
          const usuario: any = response[0];

          if (usuario.password === this.password) {
            // Login exitoso
            this.authService.setCurrentUser(usuario);
            
            // Obtener información del usuario para personalizar el mensaje
            const userName = usuario.name || 'Usuario';
            const userRole = this.authService.getUserRole();
            const roleText = this.getRoleText(userRole);

            Swal.fire({
              title: '¡Bienvenido!',
              html: `
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 3rem; margin-bottom: 15px;">👋</div>
                  <p style="font-size: 1.2rem; color: #096775; margin-bottom: 10px;">
                    <strong>Hola, ${userName}</strong>
                  </p>
                  <p style="color: #6c757d;">
                    Accediendo como <strong>${roleText}</strong>
                  </p>
                </div>
              `,
              icon: 'success',
              confirmButtonText: 'Continuar',
              confirmButtonColor: '#096775',
              background: '#ffffff',
              timer: 3000,
              timerProgressBar: true,
              showClass: {
                popup: 'animate__animated animate__fadeInUp'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOutDown'
              }
            }).then(() => {
              // Redirigir según el rol del usuario
              this.redirectByRole(userRole);
            });

          } else {
            // Contraseña incorrecta
            Swal.fire({
              title: 'Contraseña Incorrecta',
              html: `
                <div style="text-align: center; padding: 20px;">
                  <div style="font-size: 3rem; margin-bottom: 15px;">🔒</div>
                  <p>La contraseña ingresada no es correcta.</p>
                  <p style="color: #6c757d; font-size: 0.9rem;">
                    Verifica tu contraseña e intenta nuevamente.
                  </p>
                </div>
              `,
              icon: 'error',
              confirmButtonText: 'Intentar Nuevamente',
              confirmButtonColor: '#096775',
              background: '#ffffff',
              color: '#096775',
              showClass: {
                popup: 'animate__animated animate__shakeX'
              }
            }).then(() => {
              // Limpiar solo la contraseña y enfocar el campo
              this.password = '';
              const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
              if (passwordInput) {
                passwordInput.focus();
              }
            });
          }
        } else {
          // Email no encontrado
          Swal.fire({
            title: 'Usuario No Encontrado',
            html: `
              <div style="text-align: center; padding: 20px;">
                <div style="font-size: 3rem; margin-bottom: 15px;">👤❌</div>
                <p>No existe una cuenta con el email: <strong>${this.email}</strong></p>
                <p style="color: #6c757d; font-size: 0.9rem;">
                  Verifica el email o regístrate si no tienes cuenta.
                </p>
              </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Registrarse',
            cancelButtonText: 'Corregir Email',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#096775',
            background: '#ffffff',
            color: '#096775'
          }).then((result) => {
            if (result.isConfirmed) {
              this.goToRegister();
            } else {
              // Enfocar el campo de email
              const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
              if (emailInput) {
                emailInput.focus();
                emailInput.select();
              }
            }
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        
        Swal.fire({
          title: 'Error del Servidor',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
              <p>No se pudo conectar con el servidor.</p>
              <p style="color: #6c757d; font-size: 0.9rem;">
                Verifica tu conexión a internet e intenta nuevamente.
              </p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#096775',
          background: '#ffffff',
          color: '#096775',
          footer: '<span style="color: #6c757d;">Si el problema persiste, contacta al administrador</span>'
        });
      }
    });
  }

  // Validar formato de email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Obtener texto del rol
  private getRoleText(role: string): string {
    switch(role) {
      case 'admin':
        return 'Administrador';
      case 'physician':
        return 'Médico';
      case 'assistant':
        return 'Asistente Médico';
      case 'patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  }

  // Redirigir según el rol
  private redirectByRole(userRole: string) {
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
  }

  goToRegister() {
    // Confirmar navegación si hay datos en el formulario
    if (this.email || this.password) {
      Swal.fire({
        title: '¿Ir a Registro?',
        text: 'Se perderán los datos ingresados en el formulario.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, ir a registro',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        background: '#ffffff',
        color: '#096775'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/register']);
        }
      });
    } else {
      this.router.navigate(['/register']);
    }
  }

  goToHome() {
    // Confirmar navegación si hay datos en el formulario
    if (this.email || this.password) {
      Swal.fire({
        title: '¿Volver al Inicio?',
        text: 'Se perderán los datos ingresados en el formulario.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, volver al inicio',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#096775',
        cancelButtonColor: '#6c757d',
        background: '#ffffff',
        color: '#096775'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.router.navigate(['/home']);
    }
  }

  // Método para mostrar ayuda (opcional)
  showHelp() {
    Swal.fire({
      title: 'Ayuda para Iniciar Sesión',
      html: `
        <div style="text-align: left; padding: 20px;">
          <h4 style="color: #096775; margin-bottom: 15px;">¿Cómo iniciar sesión?</h4>
          <ol style="color: #6c757d; line-height: 1.6;">
            <li>Ingresa tu email registrado</li>
            <li>Ingresa tu contraseña</li>
            <li>Haz clic en "Log In"</li>
          </ol>
          
          <h4 style="color: #096775; margin: 20px 0 15px 0;">¿Olvidaste tu contraseña?</h4>
          <p style="color: #6c757d;">Contacta al administrador del sistema para recuperar tu acceso.</p>
          
          <h4 style="color: #096775; margin: 20px 0 15px 0;">¿No tienes cuenta?</h4>
          <p style="color: #6c757d;">Los pacientes pueden registrarse directamente. Para personal médico, contacta al administrador.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#096775',
      background: '#ffffff',
      width: 600
    });
  }
}