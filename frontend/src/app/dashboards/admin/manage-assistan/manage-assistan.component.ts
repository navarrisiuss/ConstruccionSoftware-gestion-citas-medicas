import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-assistan',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './manage-assistan.component.html',
  styleUrl: './manage-assistan.component.css'
})
export class ManageAssistantsComponent implements OnInit {
  assistants: any[] = [];
  filteredAssistants: any[] = [];
  isLoading: boolean = false;
  
  // Filtros
  searchName: string = '';
  searchEmail: string = '';
  
  // Paginación
  currentPage: number = 1;
  assistantsPerPage: number = 10;
  totalPages: number = 0;
  
  constructor(
    private router: Router, 
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadAssistants();
  }

  loadAssistants() {
    this.isLoading = true;
    
    Swal.fire({
      title: 'Cargando Asistentes...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.getAllAssistants().subscribe({
      next: (assistants) => {
        this.assistants = assistants;
        this.filteredAssistants = [...assistants];
        this.calculateTotalPages();
        this.isLoading = false;
        Swal.close();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error cargando asistentes:', error);
        
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los asistentes. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Aplicar filtros
  applyFilters() {
    this.filteredAssistants = this.assistants.filter(assistant => {
      const matchesName = !this.searchName || 
        assistant.name.toLowerCase().includes(this.searchName.toLowerCase()) ||
        assistant.paternalLastName.toLowerCase().includes(this.searchName.toLowerCase()) ||
        (assistant.maternalLastName && assistant.maternalLastName.toLowerCase().includes(this.searchName.toLowerCase()));
      
      const matchesEmail = !this.searchEmail || 
        assistant.email.toLowerCase().includes(this.searchEmail.toLowerCase());
      
      return matchesName && matchesEmail;
    });
    
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  clearFilters() {
    this.searchName = '';
    this.searchEmail = '';
    this.filteredAssistants = [...this.assistants];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  }

  // Paginación
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredAssistants.length / this.assistantsPerPage);
  }

  getPaginatedAssistants(): any[] {
    const startIndex = (this.currentPage - 1) * this.assistantsPerPage;
    const endIndex = startIndex + this.assistantsPerPage;
    return this.filteredAssistants.slice(startIndex, endIndex);
  }

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

  // Acciones
  viewAssistantDetails(assistant: any) {
    Swal.fire({
      title: 'Detalles del Asistente',
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>Nombre Completo:</strong> ${assistant.name} ${assistant.paternalLastName} ${assistant.maternalLastName || ''}</p>
          <p><strong>Email:</strong> ${assistant.email}</p>
          ${assistant.created_at ? `<p><strong>Fecha de Registro:</strong> ${this.formatDate(assistant.created_at)}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#007bff',
      width: 600
    });
  }

  editAssistant(assistant: any) {
    this.router.navigate(['/register-assistant'], {
      queryParams: {
        edit: 'true',
        assistantId: assistant.id,
        email: assistant.email,
        from: 'manage'  // Asegurar que viene desde gestión
      }
    });
    Swal.fire({
      title: 'Editar Asistente',
      text: `¿Deseas editar los datos de ${assistant.name} ${assistant.paternalLastName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/register-assistant'], { 
          queryParams: { 
            edit: true, 
            assistantId: assistant.id,
            email: assistant.email
          } 
        });
      }
    });
  }

  deleteAssistant(assistant: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>¿Deseas eliminar al asistente <strong>${assistant.name} ${assistant.paternalLastName}</strong>?</p>
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
        Swal.fire({
          title: 'Función no disponible',
          text: 'La eliminación de asistentes aún no está implementada por seguridad.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#007bff'
        });
      }
    });
  }

  addNewAssistant() {
    this.router.navigate(['/register-assistant'], {
      queryParams: { from: 'manage' }
    });
  }

  exportAssistants() {
    Swal.fire({
      title: 'Exportar Lista de Asistentes',
      text: 'Funcionalidad de exportación próximamente disponible.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#007bff'
    });
  }

  backToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
}