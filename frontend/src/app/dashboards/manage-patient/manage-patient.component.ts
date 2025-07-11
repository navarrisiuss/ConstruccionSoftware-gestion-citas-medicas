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
    
    // Mostrar loading
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

    this.patientService.getAllPatients().subscribe({
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
        text: 'Solo los administradores pueden eliminar pacientes.',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107'
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>¿Deseas eliminar al paciente <strong>${patient.name} ${patient.paternalLastName}</strong>?</p>
        <p style="color: #dc3545; font-size: 0.9rem;">Esta acción no se puede deshacer.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí implementarías la eliminación cuando tengas el endpoint
        Swal.fire({
          title: 'Función no disponible',
          text: 'La eliminación de pacientes aún no está implementada por seguridad.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: this.getThemeColor()
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