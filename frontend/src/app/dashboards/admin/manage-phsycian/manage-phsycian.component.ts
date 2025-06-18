import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgIf, NgFor, CommonModule} from '@angular/common';
import {AdminService} from '../../../services/admin.service';
import {PhysicianService} from '../../../services/phsycian.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-physician',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './manage-phsycian.component.html',
  styleUrls: ['./manage-phsycian.component.css']
})

export class ManagePhysicianComponent implements OnInit {
  physicians: any[] = [];
  filteredPhysicians: any[] = [];
  isLoading: boolean = false;

  //filtros
  searchName: string = '';
  searchEmail: string = '';
  searchSpecialty: string = '';

  //paginación
  currentPage: number = 1;
  physiciansPerPage: number = 10;
  totalPages: number = 0;

  //lista de especialidades para filtros
  specialties: string[] = [
    'Cardiología',
    'Dermatología',
    'Endocrinología',
    'Gastroenterología',
    'Ginecología',
    'Neurología',
    'Oftalmología',
    'Ortopedia',
    'Pediatría',
    'Psiquiatría',
    'Radiología',
    'Urología',
    'Medicina General'
  ];

  constructor(
    private adminService: AdminService,
    private physicianService: PhysicianService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadPhysicians();
    // Obtener array de medicos desde el servicio e imprimirlo en consola
    this.adminService.getAllPhysicians().subscribe({
      next: (physicians) => {
        console.log('Lista de médicos:', physicians);
      },
      error: (error) => {
        console.error('Error al obtener médicos:', error);
      }
    });
  }

  loadPhysicians() {
    this.isLoading = true;

    // Mostrar loading
    Swal.fire({
      title: 'Cargando Médicos...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.adminService.getAllPhysicians().subscribe({
      next: (physicians) => {
        this.physicians = physicians;
        this.filteredPhysicians = [...physicians];
        this.calculateTotalPages();
        this.isLoading = false;
        Swal.close();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.close();
        console.error('Error cargando médicos:', error);

        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los médicos. Intenta nuevamente.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  applyFilters() {
    this.filteredPhysicians = this.physicians.filter(physician => {
      const matchesName = !this.searchName ||
        physician.name.toLowerCase().includes(this.searchName.toLowerCase()) ||
        physician.paternalLastName.toLowerCase().includes(this.searchName.toLowerCase()) ||
        (physician.maternalLastName && physician.maternalLastName.toLowerCase().includes(this.searchName.toLowerCase()));

      const matchesEmail = !this.searchEmail ||
        physician.email.toLowerCase().includes(this.searchEmail.toLowerCase());

      const matchesSpecialty = !this.searchSpecialty ||
        physician.specialty === this.searchSpecialty;

      return matchesName && matchesEmail && matchesSpecialty;
    });

    this.currentPage = 1;
    this.calculateTotalPages();
  }

  clearFilters() {
    this.searchName = '';
    this.searchEmail = '';
    this.searchSpecialty = '';
    this.filteredPhysicians = [...this.physicians];
    this.currentPage = 1;
    this.calculateTotalPages();
  }

  //formatear fecha para mostrar
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL');
  }

  // paginación
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.filteredPhysicians.length / this.physiciansPerPage);
  }

  getPaginatedPhysicians(): any[] {
    const startIndex = (this.currentPage - 1) * this.physiciansPerPage;
    const endIndex = startIndex + this.physiciansPerPage;
    return this.filteredPhysicians.slice(startIndex, endIndex);
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

  // acciones de médico
  editPhysician(physician: any) {
    this.router.navigate(['/register-physician'], {
      queryParams: {
        edit: 'true',
        physicianId: physician.id,
        email: physician.email,
        from: 'manage'  // Asegurar que viene desde gestión
      }
    });
    Swal.fire({
      title: 'Editar Médico',
      text: `¿Deseas editar los datos del Dr. ${physician.name} ${physician.paternalLastName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, editar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // redirigir al formulario de edición
        this.router.navigate(['/register-physician'], {
          queryParams: {
            edit: true,
            physicianId: physician.id,
            email: physician.email
          }
        });
      }
    });
  }

  viewPhysicianDetails(physician: any) {
    Swal.fire({
      title: 'Detalles del Médico',
      html: `
        <div style="text-align: left; padding: 20px;">
          <p><strong>Nombre Completo:</strong> Dr. ${physician.name} ${physician.paternalLastName} ${physician.maternalLastName || ''}</p>
          <p><strong>Email:</strong> ${physician.email}</p>
          <p><strong>Especialidad:</strong> ${physician.specialty}</p>
          ${physician.created_at ? `<p><strong>Fecha de Registro:</strong> ${this.formatDate(physician.created_at)}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#007bff',
      width: 600
    });
  }

  deletePhysician(physician: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      html: `
        <p>¿Deseas eliminar al médico <strong>Dr. ${physician.name} ${physician.paternalLastName}</strong>?</p>
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
        console.log(physician.id);
        this.physicianService.deletePhysician(physician.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Médico Eliminado',
              text: `El médico Dr. ${physician.name} ${physician.paternalLastName} ha sido eliminado correctamente.`,
              icon: 'success',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#007bff'
            });
            // Recargar la lista de médicos
            this.loadPhysicians();
          },
          error: (error) => {
            console.error('Error eliminando médico:', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar el médico. Intenta nuevamente.',
              icon: 'error',
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#dc3545'
            });
          }
        });
      }
    });
  }

  // Agregar nuevo médico
  addNewPhysician() {
    // Indicar que viene desde gestión
    this.router.navigate(['/register-physician'], {
      queryParams: {from: 'manage'}
    });
  }

  // Exportar lista
  exportPhysicians() {
    Swal.fire({
      title: 'Exportar Lista de Médicos',
      text: 'Funcionalidad de exportación próximamente disponible.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#007bff'
    });
  }

  // Volver al dashboard
  backToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
}
