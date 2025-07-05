import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {Patient} from '../../../models/patient.model';
import {Gender} from '../../../models/gender.enum';
import {NgIf} from '@angular/common';
import {PatientService} from '../../../services/patient.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private router: Router, private patientService: PatientService) {}

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
  // 🎯 Cambiar inicialización del gender
  gender: Gender | null = null;
  isLoading: boolean = false;

  // Nuevas variables para manejo de paciente existente
  existingPatient: any = null;
  isEditMode: boolean = false;
  rutChecked: boolean = false;

  Gender = Gender;

  // Método para verificar RUT cuando pierde el foco
  async onRutBlur() {
    if (this.rut.trim() && this.rut.length >= 8) {
      await this.checkRutExists();
    }
  }

// Verificar si el RUT ya existe
  async checkRutExists() {
    if (!this.rut.trim()) {
      console.warn('[checkRutExists] RUT vacío o solo espacios en blanco.');
      return;
    }

    console.log('[checkRutExists] Iniciando verificación de RUT:', this.rut);

    // Mostrar loading
    Swal.fire({
      title: 'Verificando RUT...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
        console.log('[checkRutExists] Loading mostrado');
      }
    });

    this.patientService.checkRutExists(this.rut).subscribe({
      next: (response) => {
        Swal.close();
        console.log('[checkRutExists] Respuesta del backend recibida:', response);

        if (response && typeof response.exists !== 'undefined') {
          if (response.exists) {
            console.log('[checkRutExists] El RUT ya existe. Mostrando paciente existente.');
            this.existingPatient = response.patient;
            this.showExistingPatientDialog();
          } else {
            console.log('[checkRutExists] El RUT no existe. Permitido continuar con el registro.');
            this.rutChecked = true;
            Swal.fire({
              title: 'RUT Disponible',
              text: 'Este RUT no está registrado. Puedes continuar con el registro.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } else {
          console.warn('[checkRutExists] Respuesta inesperada o malformada. Asumiendo que el RUT no existe.');
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
        console.error('[checkRutExists] Error verificando RUT:', error);

        if (error.status === 404 || error.status === 500) {
          console.warn('[checkRutExists] Error del servidor o tabla vacía. Asumiendo RUT no registrado.');
          this.rutChecked = true;
          Swal.fire({
            title: 'RUT Disponible',
            text: 'Este RUT no está registrado (tabla posiblemente vacía). Puedes continuar con el registro.',
            icon: 'info',
            timer: 2500,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo verificar el RUT. Intenta nuevamente.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
        }
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
      cancelButtonText: 'Ir al Login',
      confirmButtonColor: '#28a745',
      denyButtonColor: '#ffc107',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loadExistingPatientData();
      } else if (result.isDenied) {
        this.clearRutField();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.router.navigate(['/login']);
      }
    });
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
      title: this.isEditMode ? 'Actualizando...' : 'Registrando...',
      text: 'Por favor espera mientras procesamos tu información',
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

        Swal.fire({
          title: '¡Datos Actualizados!',
          text: `${this.name}, tus datos han sido actualizados exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Ir al Login',
          confirmButtonColor: '#28a745',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login']);
          }
        });

        this.resetForm();
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

  sendHTTPPetition() {
    this.patientService.registerPatient(this.patient).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Paciente registrado exitosamente:', response);

        Swal.fire({
          title: '¡Registro Exitoso!',
          text: `¡Bienvenido ${this.name}! Tu cuenta ha sido creada exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Ir al Login',
          confirmButtonColor: '#28a745',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/login']);
          }
        });

        this.resetForm();
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
    // 🎯 Agregar validación para género
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
    this.gender = null; // 🎯 Cambiar aquí
    this.existingPatient = null;
    this.isEditMode = false;
    this.rutChecked = false;
  }

  backToHome() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si sales ahora, perderás todos los datos ingresados',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6c757d',
      cancelButtonColor: '#28a745',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Continuar registrándome'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/home']);
      }
    });
  }
}
