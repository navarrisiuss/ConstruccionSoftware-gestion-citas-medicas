import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Assistant } from '../../../models/assistant.model';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

// Interfaz para datos de actualización de asistente
interface AssistantUpdateData {
  name: string;
  paternalLastName: string;
  maternalLastName: string;
  email: string;
  password?: string; // Opcional para actualizaciones
}

@Component({
  selector: 'app-register-assistant',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './register-assistant.component.html',
  styleUrl: './register-assistant.component.css'
})
export class RegisterAssistantComponent implements OnInit {
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  // Variables para modo edición
  isEditMode: boolean = false;
  assistantId: number | null = null;
  originalEmail: string = '';

  // 🎯 Variable bandera para navegación condicional
  shouldReturnToManage: boolean = false;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    // Verificar si estamos en modo edición
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true' && params['assistantId'] && params['email']) {
        this.isEditMode = true;
        this.assistantId = parseInt(params['assistantId']);
        this.originalEmail = params['email'];
        // 🎯 Establecer bandera para volver a gestión de asistentes
        this.shouldReturnToManage = true;
        this.loadAssistantData();
      } else {
        // 🎯 Modo registro: volver al dashboard admin
        this.shouldReturnToManage = false;
      }
    });

    // 🎯 También verificar parámetros adicionales para determinar origen
    this.route.queryParams.subscribe(params => {
      if (params['from'] === 'manage') {
        this.shouldReturnToManage = true;
      }
    });
  }

  loadAssistantData() {
    if (!this.originalEmail) return;

    this.isLoading = true;

    // Mostrar loading
    Swal.fire({
      title: 'Cargando datos del asistente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.getAssistantByEmail(this.originalEmail).subscribe({
      next: (assistants) => {
        if (assistants.length > 0) {
          const assistant = assistants[0];
          this.name = assistant.name;
          this.paternalLastName = assistant.paternalLastName;
          this.maternalLastName = assistant.maternalLastName || '';
          this.email = assistant.email;
          // No cargar la contraseña por seguridad
          this.password = '';
        }
        this.isLoading = false;
        Swal.close();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error cargando asistente:', error);
        
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los datos del asistente.',
          icon: 'error',
          confirmButtonText: 'Volver',
          confirmButtonColor: '#dc3545'
        }).then(() => {
          this.backToDashboard();
        });
      }
    });
  }

  registerAssistant() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isEditMode) {
      this.updateAssistant();
    } else {
      this.createAssistant();
    }
  }

  createAssistant() {
    // Mostrar loading
    Swal.fire({
      title: 'Registrando asistente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const newAssistant = new Assistant(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password
    );

    this.adminService.registerAssistant(newAssistant).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.close();
        
        Swal.fire({
          title: '¡Éxito!',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">👩‍💼✅</div>
              <p style="font-size: 1.2rem; color: #17a2b8; margin-bottom: 10px;">
                <strong>Asistente registrado exitosamente</strong>
              </p>
              <p style="color: #6c757d;">
                ${this.name} ${this.paternalLastName} ha sido agregado al sistema
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#17a2b8',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          this.resetForm();
          // 🎯 Navegación condicional después del registro
          this.navigateBack();
        });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error al registrar asistente:', error);
        
        let errorMessage = 'Error al registrar asistente';
        
        // Manejar error de email duplicado
        if (error.message && error.message.includes('Duplicate entry')) {
          errorMessage = 'Ya existe un asistente registrado con este email';
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: 'Error al Registrar',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
              <p>${errorMessage}</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  updateAssistant() {
    if (!this.assistantId) {
      Swal.fire({
        title: 'Error',
        text: 'ID de asistente no válido',
        icon: 'error',
        confirmButtonText: 'Volver'
      }).then(() => {
        this.backToDashboard();
      });
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Actualizando asistente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const assistantData: AssistantUpdateData = {
      name: this.name,
      paternalLastName: this.paternalLastName,
      maternalLastName: this.maternalLastName,
      email: this.email
    };

    // Si se ingresó una nueva contraseña, incluirla
    if (this.password && this.password.trim() !== '') {
      assistantData.password = this.password;
    }

    this.adminService.updateAssistant(this.assistantId, assistantData).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.close();
        
        Swal.fire({
          title: '¡Éxito!',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">👩‍💼✅</div>
              <p style="font-size: 1.2rem; color: #17a2b8; margin-bottom: 10px;">
                <strong>Asistente actualizado exitosamente</strong>
              </p>
              <p style="color: #6c757d;">
                Los datos de ${this.name} ${this.paternalLastName} han sido actualizados
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#17a2b8',
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          // 🎯 Siempre volver a gestión después de editar
          this.router.navigate(['/admin/manage-assistants']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error al actualizar asistente:', error);
        
        let errorMessage = 'Error al actualizar asistente';
        
        // Manejar error de email duplicado
        if (error.message && error.message.includes('Duplicate entry')) {
          errorMessage = 'Ya existe otro asistente registrado con este email';
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: 'Error al Actualizar',
          html: `
            <div style="text-align: center; padding: 20px;">
              <div style="font-size: 3rem; margin-bottom: 15px;">❌</div>
              <p>${errorMessage}</p>
            </div>
          `,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.name.trim()) {
      Swal.fire({
        title: 'Campo Requerido',
        text: 'El nombre es requerido',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }
    
    if (!this.paternalLastName.trim()) {
      Swal.fire({
        title: 'Campo Requerido',
        text: 'El apellido paterno es requerido',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }
    
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      Swal.fire({
        title: 'Email Inválido',
        text: 'Debe ingresar un email válido',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }
    
    // Validar contraseña solo en modo creación o si se ingresó una nueva
    if (!this.isEditMode && (!this.password || this.password.length < 6)) {
      Swal.fire({
        title: 'Contraseña Inválida',
        text: 'La contraseña debe tener al menos 6 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }
    
    if (this.isEditMode && this.password && this.password.length < 6) {
      Swal.fire({
        title: 'Contraseña Inválida',
        text: 'Si deseas cambiar la contraseña, debe tener al menos 6 caracteres',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return false;
    }
    
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm() {
    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.isEditMode = false;
    this.assistantId = null;
    this.originalEmail = '';
  }

  // 🎯 Método mejorado para navegación condicional
  backToDashboard() {
    // Verificar si hay cambios sin guardar
    if (this.hasUnsavedChanges()) {
      const destination = this.getDestinationText();
      
      Swal.fire({
        title: '¿Descartar cambios?',
        html: `
          <div style="text-align: center; padding: 15px;">
            <p>Tienes cambios sin guardar.</p>
            <p style="color: #6c757d; font-size: 0.9rem;">
              ¿Estás seguro de que quieres volver ${destination}?
            </p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }

  // 🎯 Método centralizado para la navegación
  private navigateBack() {
    if (this.shouldReturnToManage || this.isEditMode) {
      // Volver a gestión de asistentes
      this.router.navigate(['/admin/manage-assistants']);
    } else {
      // Volver al dashboard principal de admin
      this.router.navigate(['/admin-dashboard']);
    }
  }

  // 🎯 Método para obtener texto de destino dinámico
  private getDestinationText(): string {
    if (this.shouldReturnToManage || this.isEditMode) {
      return 'a la gestión de asistentes';
    } else {
      return 'al dashboard principal';
    }
  }

  // 🎯 Método para obtener el texto del botón dinámico
  getBackButtonText(): string {
    if (this.shouldReturnToManage || this.isEditMode) {
      return '← Volver a Gestión';
    } else {
      return '← Volver al Dashboard';
    }
  }

  private hasUnsavedChanges(): boolean {
    if (!this.isEditMode) {
      return this.name.trim() !== '' || 
             this.paternalLastName.trim() !== '' || 
             this.maternalLastName.trim() !== '' || 
             this.email.trim() !== '' || 
             this.password.trim() !== '';
    }
    
    // En modo edición, verificar si hay cambios desde los datos originales
    return this.email !== this.originalEmail || 
           this.password.trim() !== '';
  }

  // Método para mostrar/ocultar contraseña
  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }
}