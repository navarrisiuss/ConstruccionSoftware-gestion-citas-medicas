import {Component, OnInit} from '@angular/core'; // ✅ Agregar OnInit
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Patient} from '../../../models/patient.model';
import {Gender} from '../../../models/gender.enum';
import {NgIf, NgClass} from '@angular/common';
import {PatientService} from '../../../services/patient.service';
import {AuthService} from '../../../services/auth.service'; // ✅ Importar AuthService
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-patient',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register-patient.component.html',
  styleUrl: './register-patient.component.css'
})
export class RegisterPatientComponent implements OnInit { // ✅ Implementar OnInit
  // ✅ Agregar propiedades para gestión del usuario
  currentUser: any = null;
  userRole: string = '';

  constructor(
    private router: Router, 
    private patientService: PatientService,
    private authService: AuthService // ✅ Inyectar AuthService
  ) {}
  
  patient = new Patient('', '', '', '', '', '', new Date(), '', '', null);
  name: string = '';
  paternalLastName: string = '';
  maternalLastName: string = '';
  email: string = '';
  password: string = '';
  rut: string = '';
  birthDate: string = '';
  phone: string = '';
  address: string = '';
  gender: Gender | null = null;
  isLoading: boolean = false;
  
  // Nuevas variables para manejo de paciente existente
  existingPatient: any = null;
  isEditMode: boolean = false;
  rutChecked: boolean = false;

  Gender = Gender;

  // ✅ Implementar ngOnInit para detectar el usuario
  ngOnInit() {
    this.detectCurrentUser();
  }

  // ✅ Método para detectar el usuario actual y su rol
  detectCurrentUser() {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser) {
      this.userRole = this.currentUser.role || '';
      console.log('Usuario actual en registro:', this.currentUser);
      console.log('Rol detectado:', this.userRole);
    } else {
      // Si no hay usuario, redirigir al login
      console.warn('No hay usuario autenticado');
      this.router.navigate(['/login']);
    }
  }
  // Método para verificar RUT cuando pierde el foco
  async onRutBlur() {
    if (this.rut.trim() && this.rut.length >= 8) {
      await this.checkRutExists();
    }
  }

  // Verificar si el RUT ya existe
  async checkRutExists() {
    if (!this.rut.trim()) return;

    // Mostrar loading
    Swal.fire({
      title: 'Verificando RUT...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.patientService.checkRutExists(this.rut).subscribe({
      next: (response) => {
        Swal.close();
        
        if (response.exists) {
          this.existingPatient = response.patient;
          this.showExistingPatientDialog();
        } else {
          this.rutChecked = true;
          Swal.fire({
            title: 'RUT Disponible',
            text: 'Este RUT no está registrado. Puedes continuar con el registro.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        Swal.close();
        console.error('Error verificando RUT:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo verificar el RUT. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Mostrar diálogo con datos del paciente existente
  showExistingPatientDialog() {
    const patient = this.existingPatient;
    
    Swal.fire({
      title: 'Paciente Ya Registrado',
      html: `
        <div style="text-align: left; padding: 20px;">
          <h4>Se encontró un paciente con este RUT:</h4>
          <p><strong>Nombre:</strong> ${patient.name} ${patient.paternalLastName} ${patient.maternalLastName || ''}</p>
          <p><strong>Email:</strong> ${patient.email}</p>
          <p><strong>Teléfono:</strong> ${patient.phone}</p>
          <p><strong>Dirección:</strong> ${patient.address}</p>
          <br>
          <p>¿Qué deseas hacer?</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Editar Datos',
      denyButtonText: 'Usar Otro RUT',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadExistingPatientData();
      } else if (result.isDenied) {
        this.clearRutField();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.clearRutField();
      }
    });
  }
  getRoleDisplayName(): string {
    switch (this.userRole) {
      case 'admin':
        return 'Administrador';
      case 'assistant':
        return 'Asistente Médico';
      case 'physician':
        return 'Médico';
      case 'patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  }

  // Cargar datos del paciente existente para editar
  loadExistingPatientData() {
    const patient = this.existingPatient;
    
    this.name = patient.name;
    this.paternalLastName = patient.paternalLastName;
    this.maternalLastName = patient.maternalLastName || '';
    this.email = patient.email;
    this.password = ''; // Por seguridad, no mostrar la contraseña
    this.birthDate = patient.birthDate ? patient.birthDate.split('T')[0] : '';
    this.phone = patient.phone;
    this.address = patient.address;
    this.gender = patient.gender;
    
    this.isEditMode = true;
    this.rutChecked = true;

    Swal.fire({
      title: 'Modo Edición Activado',
      text: 'Los datos del paciente han sido cargados. Modifica lo que necesites y guarda los cambios.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#17a2b8'
    });
  }

  // Limpiar campo RUT
  clearRutField() {
    this.rut = '';
    this.existingPatient = null;
    this.isEditMode = false;
    this.rutChecked = false;
  }

  async register() {
    // Si no se ha verificado el RUT, verificarlo primero
    if (!this.rutChecked && !this.isEditMode) {
      await this.checkRutExists();
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    
    // Mostrar loading
    Swal.fire({
      title: this.isEditMode ? 'Actualizando Paciente...' : 'Registrando Paciente...',
      text: 'Por favor espera mientras procesamos la información',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.patient = new Patient(
      this.name,
      this.paternalLastName,
      this.maternalLastName,
      this.email,
      this.password,
      this.rut,
      new Date(this.birthDate),
      this.phone,
      this.address,
      this.gender
    );
    
    if (this.isEditMode) {
      this.updateExistingPatient();
    } else {
      this.sendHTTPPetition();
    }
  }

  // Actualizar paciente existente
  updateExistingPatient() {
    this.patientService.updatePatient(this.existingPatient.id, this.patient).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Paciente actualizado exitosamente:', response);
        
        const dashboardName = this.getDashboardName();
        
        Swal.fire({
          title: '¡Paciente Actualizado!',
          text: `Los datos de ${this.name} han sido actualizados exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Continuar',
          showCancelButton: true,
          cancelButtonText: `Volver al ${dashboardName}`,
          confirmButtonColor: this.getThemeColor(),
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            this.resetForm();
          } else {
            this.navigateToDashboard();
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error actualizando paciente:', error);
        
        Swal.fire({
          title: 'Error en la Actualización',
          text: `Hubo un problema: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Intentar de Nuevo',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
  backToDashboard() {
    if (this.hasUnsavedChanges()) {
      const dashboardName = this.getDashboardName();
      
      Swal.fire({
        title: '¿Estás seguro?',
        text: `Si sales ahora, perderás todos los datos ingresados`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6c757d',
        cancelButtonColor: this.getThemeColor(),
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Continuar editando'
      }).then((result) => {
        if (result.isConfirmed) {
          this.navigateToDashboard();
        }
      });
    } else {
      this.navigateToDashboard();
    }
  }

  // ✅ Método para navegar al dashboard correcto según el rol
  private navigateToDashboard() {
    const dashboardRoute = this.getDashboardRoute();
    console.log('Navegando a:', dashboardRoute);
    this.router.navigate([dashboardRoute]);
  }

  // ✅ Obtener la ruta del dashboard según el rol
  private getDashboardRoute(): string {
    switch (this.userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'assistant':
        return '/assistant-dashboard';
      case 'physician':
        return '/physician-dashboard';
      case 'patient':
        return '/patient-dashboard';
      default:
        console.warn('Rol no reconocido:', this.userRole);
        return '/login'; // Si no reconoce el rol, volver al login
    }
  }

  // ✅ Obtener el nombre del dashboard para mostrar en mensajes
  private getDashboardName(): string {
    switch (this.userRole) {
      case 'admin':
        return 'Dashboard de Administrador';
      case 'assistant':
        return 'Dashboard de Asistente';
      case 'physician':
        return 'Dashboard de Médico';
      case 'patient':
        return 'Dashboard de Paciente';
      default:
        return 'Dashboard';
    }
  }

  get dashboardName(): string {
    return this.getDashboardName();
  }

  // ✅ Obtener color del tema según el rol
  private getThemeColor(): string {
    switch (this.userRole) {
      case 'admin':
        return '#007bff';
      case 'assistant':
        return '#17a2b8';
      case 'physician':
        return '#28a745';
      case 'patient':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  sendHTTPPetition() {
    this.patientService.registerPatient(this.patient).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Paciente registrado exitosamente:', response);
        
        const dashboardName = this.getDashboardName();
        
        Swal.fire({
          title: '¡Paciente Registrado!',
          text: `${this.name} ha sido registrado exitosamente en el sistema.`,
          icon: 'success',
          confirmButtonText: 'Registrar Otro',
          showCancelButton: true,
          cancelButtonText: `Volver al ${dashboardName}`,
          confirmButtonColor: this.getThemeColor(),
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            this.resetForm();
          } else {
            this.navigateToDashboard();
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error registrando paciente:', error);
        
        Swal.fire({
          title: 'Error en el Registro',
          text: `Hubo un problema: ${error.message}`,
          icon: 'error',
          confirmButtonText: 'Intentar de Nuevo',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  validateForm(): boolean {
    if (!this.name.trim()) {
      this.showValidationError('El nombre es requerido');
      return false;
    }
    if (!this.paternalLastName.trim()) {
      this.showValidationError('El apellido paterno es requerido');
      return false;
    }
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      this.showValidationError('Por favor ingresa un email válido');
      return false;
    }
    if (!this.password || this.password.length < 6) {
      this.showValidationError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!this.rut.trim()) {
      this.showValidationError('El RUT es requerido');
      return false;
    }
    if (!this.birthDate) {
      this.showValidationError('La fecha de nacimiento es requerida');
      return false;
    }
    if (!this.phone.trim()) {
      this.showValidationError('El teléfono es requerido');
      return false;
    }
    if (!this.address.trim()) {
      this.showValidationError('La dirección es requerida');
      return false;
    }
    if (this.gender === null) {
      this.showValidationError('Por favor selecciona tu género');
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showValidationError(message: string) {
    Swal.fire({
      title: 'Datos Incompletos',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ffc107'
    });
  }

  resetForm() {
    this.name = '';
    this.paternalLastName = '';
    this.maternalLastName = '';
    this.email = '';
    this.password = '';
    this.rut = '';
    this.birthDate = '';
    this.phone = '';
    this.address = '';
    this.gender = null;
    this.existingPatient = null;
    this.isEditMode = false;
    this.rutChecked = false;
  }

  hasUnsavedChanges(): boolean {
    return !!(this.name || this.paternalLastName || this.email || this.rut);
  }
}