import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-patients',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './manage-patient.component.html',
  styleUrl: './manage-patient.component.css'
})
export class ManagePatientsComponent implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  isLoading: boolean = false;
  
  // Filtros
  searchName: string = '';
  searchRut: string = '';
  searchDate: string = '';
  
  // Paginación
  currentPage: number = 1;
  patientsPerPage: number = 10;
  totalPages: number = 0;
  
  // Para identificar el tipo de usuario
  userRole: string = '';
  
  constructor(
    private router: Router, 
    private patientService: PatientService
  ) {
    // Detectar el rol del usuario desde la URL o localStorage
    this.detectUserRole();
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  detectUserRole() {
    // Detectar rol basado en la ruta actual
    const currentUrl = this.router.url;
    if (currentUrl.includes('admin')) {
      this.userRole = 'admin';
    } else if (currentUrl.includes('assistant')) {
      this.userRole = 'assistant';
    } else if (currentUrl.includes('physician')) {
      this.userRole = 'physician';
    } else {
      this.userRole = 'admin'; // Default
    }
  }

  loadPatients() {
    this.isLoading = true;
    
    Swal.fire({
      title: 'Cargando Pacientes...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    // ✅ Cargar todos los pacientes (activos e inactivos para admin)
    const includeInactive = this.userRole === 'admin';
    
    this.patientService.getAllPatients(includeInactive).subscribe({
      next: (patients) => {
        this.patients = patients;
        this.filteredPatients = [...patients];
        this.calculateTotalPages();
        this.isLoading = false;
        Swal.close();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error cargando pacientes:', error);
        
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los pacientes. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Aplicar filtros
  applyFilters() {
    this.filteredPatients = this.patients.filter(patient => {
      const matchesName = !this.searchName || 
        patient.name.toLowerCase().includes(this.searchName.toLowerCase()) ||
        patient.paternalLastName.toLowerCase().includes(this.searchName.toLowerCase()) ||
        (patient.maternalLastName && patient.maternalLastName.toLowerCase().includes(this.searchName.toLowerCase()));
      
      const matchesRut = !this.searchRut || 
        patient.rut.includes(this.searchRut);
      
      const matchesDate = !this.searchDate || 
        this.formatDate(patient.created_at || patient.birthDate).includes(this.searchDate);
      
      return matchesName && matchesRut && matchesDate;
    });
    
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  // Limpiar filtros
  clearFilters() {
    this.searchName = '';
    this.searchRut = '';
    this.searchDate = '';
    this.filteredPatients = [...this.patients];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  // Formatear fecha para mostrar
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  }

  // Paginación
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredPatients.length / this.patientsPerPage);
  }

  getPaginatedPatients(): any[] {
    const startIndex = (this.currentPage - 1) * this.patientsPerPage;
    const endIndex = startIndex + this.patientsPerPage;
    return this.filteredPatients.slice(startIndex, endIndex);
  }

  // Método para generar números de paginación
  getPaginationNumbers(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Acciones de paciente
  editPatient(patient: any) {
    Swal.fire({
      title: 'Editar Paciente',
      text: `¿Deseas editar los datos de ${patient.name} ${patient.paternalLastName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: this.getThemeColor(),
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirigir según el rol del usuario
        const registerRoute = this.getRegisterRoute();
        this.router.navigate([registerRoute], { 
          queryParams: { 
            edit: true, 
            patientId: patient.id,
            rut: patient.rut
          } 
        });
      }
    });
  }

  viewPatientDetails(patient: any) {
    Swal.fire({
      title: 'Detalles del Paciente',
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>Nombre Completo:</strong> ${patient.name} ${patient.paternalLastName} ${patient.maternalLastName || ''}</p>
          <p><strong>RUT:</strong> ${patient.rut}</p>
          <p><strong>Email:</strong> ${patient.email}</p>
          <p><strong>Teléfono:</strong> ${patient.phone}</p>
          <p><strong>Dirección:</strong> ${patient.address}</p>
          <p><strong>Fecha de Nacimiento:</strong> ${this.formatDate(patient.birthDate)}</p>
          <p><strong>Género:</strong> ${patient.gender === 0 ? 'Masculino' : 'Femenino'}</p>
          ${patient.created_at ? `<p><strong>Fecha de Registro:</strong> ${this.formatDate(patient.created_at)}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: this.getThemeColor(),
      width: 600
    });
  }

  deletePatient(patient: any) {
    if (this.userRole !== 'admin') {
      Swal.fire({
        title: 'Acceso Denegado',
        text: 'Solo los administradores pueden desactivar pacientes.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return;
    }
  
    // ✅ CORREGIR: Verificar estado usando active (0 = inactivo, 1 = activo)
    if (patient.active === 0 || patient.active === false) {
      this.showInactivePatientOptions(patient);
      return;
    }
  
    Swal.fire({
      title: '¿Desactivar paciente?',
      html: `
        <p>¿Deseas desactivar al paciente <strong>${patient.name} ${patient.paternalLastName}</strong>?</p>
        <p style="color: #856404; font-size: 0.9rem;">
          <i class="fas fa-info-circle"></i> El paciente será desactivado pero mantendrá su historial médico.
        </p>
        <p style="color: #6c757d; font-size: 0.8rem;">
          <strong>✅ Ventajas:</strong> Se puede reactivar en cualquier momento y conserva todas las citas médicas.
        </p>
      `,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#ffc107',
      denyButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '🔒 Desactivar',
      denyButtonText: '🗑️ Eliminar Permanente',
      cancelButtonText: '❌ Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.deactivatePatient(patient);
      } else if (result.isDenied) {
        this.permanentDeletePatient(patient);
      }
    });
  }
  
  // ✅ NUEVO: Opciones para pacientes inactivos
  private showInactivePatientOptions(patient: any) {
    Swal.fire({
      title: 'Paciente Inactivo',
      html: `
        <p>El paciente <strong>${patient.name} ${patient.paternalLastName}</strong> está desactivado.</p>
        <p style="color: #6c757d; font-size: 0.9rem;">¿Qué acción deseas realizar?</p>
      `,
      icon: 'info',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#28a745',
      denyButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '✅ Reactivar',
      denyButtonText: '🗑️ Eliminar Permanente',
      cancelButtonText: '❌ Cancelar',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.reactivatePatient(patient);
      } else if (result.isDenied) {
        this.permanentDeletePatient(patient);
      }
    });
  }
  
  // ✅ NUEVO: Desactivar paciente
  private deactivatePatient(patient: any) {
    Swal.fire({
      title: 'Desactivando paciente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.patientService.deactivatePatient(patient.id.toString()).subscribe({
      next: (response) => {
        console.log('Paciente desactivado exitosamente:', response);
        Swal.fire({
          title: 'Paciente Desactivado',
          text: `${patient.name} ${patient.paternalLastName} ha sido desactivado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error desactivando paciente:', error);
        
        let errorMessage = 'No se pudo desactivar el paciente.';
        if (error.status === 400) {
          errorMessage = 'El paciente ya está desactivado.';
        }
        
        Swal.fire({
          title: 'Error al Desactivar',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
  
  // ✅ NUEVO: Reactivar paciente
  private reactivatePatient(patient: any) {
    Swal.fire({
      title: 'Reactivando paciente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.patientService.reactivatePatient(patient.id.toString()).subscribe({
      next: (response) => {
        console.log('Paciente reactivado exitosamente:', response);
        Swal.fire({
          title: 'Paciente Reactivado',
          text: `${patient.name} ${patient.paternalLastName} ha sido reactivado exitosamente.`,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error reactivando paciente:', error);
        
        let errorMessage = 'No se pudo reactivar el paciente.';
        if (error.status === 400) {
          errorMessage = 'El paciente ya está activo.';
        }
        
        Swal.fire({
          title: 'Error al Reactivar',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
  
  // ✅ NUEVO: Eliminación permanente (solo casos extremos)
  private permanentDeletePatient(patient: any) {
    Swal.fire({
      title: '⚠️ ELIMINACIÓN PERMANENTE',
      html: `
        <p><strong>¿Estás absolutamente seguro?</strong></p>
        <p>Esto eliminará permanentemente a <strong>${patient.name} ${patient.paternalLastName}</strong> del sistema.</p>
        <p style="color: #dc3545; font-size: 0.9rem;">
          <strong>⚠️ ADVERTENCIA:</strong> Esta acción NO se puede deshacer.
        </p>
        <p style="color: #6c757d; font-size: 0.8rem;">
          <strong>Nota:</strong> Si el paciente tiene historial médico, se recomienda mantenerlo desactivado.
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: '🗑️ Eliminar Permanentemente',
      cancelButtonText: '❌ Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.executePermanentDelete(patient);
      }
    });
  }
  
  // ✅ NUEVO: Ejecutar eliminación permanente
  private executePermanentDelete(patient: any) {
    Swal.fire({
      title: 'Eliminando permanentemente...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.patientService.deletePatient(patient.id.toString()).subscribe({
      next: (response) => {
        console.log('Paciente eliminado permanentemente:', response);
        Swal.fire({
          title: 'Paciente Eliminado',
          text: `${patient.name} ${patient.paternalLastName} ha sido eliminado permanentemente del sistema.`,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
        this.loadPatients();
      },
      error: (error) => {
        console.error('Error eliminando paciente permanentemente:', error);
        
        let errorMessage = 'No se pudo eliminar el paciente permanentemente.';
        
        if (error.status === 400) {
          errorMessage = error.error.message || 'Debe desactivar el paciente primero.';
        } else if (error.status === 409) {
          errorMessage = 'El paciente tiene historial médico asociado. Se recomienda mantenerlo desactivado.';
        }
        
        Swal.fire({
          title: 'Error al Eliminar',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Agregar nuevo paciente
  addNewPatient() {
    const registerRoute = this.getRegisterRoute();
    this.router.navigate([registerRoute]);
  }

  // Volver al dashboard correspondiente
  backToDashboard() {
    const dashboardRoute = this.getDashboardRoute();
    this.router.navigate([dashboardRoute]);
  }

  // Métodos auxiliares para rutas según el rol
  private getRegisterRoute(): string {
    switch (this.userRole) {
      case 'admin':
        return '/register-patient';
      case 'assistant':
        return '/register-patient';
      case 'physician':
        return '/register-patient';
      default:
        return '/register-patient';
    }
  }

  private getDashboardRoute(): string {
    switch (this.userRole) {
      case 'admin':
        return '/admin-dashboard';
      case 'assistant':
        return '/assistant-dashboard';
      case 'physician':
        return '/physician-dashboard';
      default:
        return '/admin-dashboard';
    }
  }

  private getThemeColor(): string {
    switch (this.userRole) {
      case 'admin':
        return '#007bff';
      case 'assistant':
        return '#17a2b8';
      case 'physician':
        return '#28a745';
      default:
        return '#17a2b8';
    }
  }

  // Obtener título según el rol
  getTitle(): string {
    switch (this.userRole) {
      case 'admin':
        return 'Gestión de Pacientes - Administrador';
      case 'assistant':
        return 'Gestión de Pacientes - Asistente';
      case 'physician':
        return 'Gestión de Pacientes - Médico';
      default:
        return 'Gestión de Pacientes';
    }
  }
}