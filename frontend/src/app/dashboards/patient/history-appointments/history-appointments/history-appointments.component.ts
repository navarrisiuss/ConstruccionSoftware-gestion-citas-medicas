import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../services/admin.service';

interface AppointmentHistory {
  id: number;
  date: string;
  time: string;
  physician: string;
  physician_specialty: string;
  reason: string;
  status: string;
  notes?: string;
  medical_notes?: string;
  preparation_notes?: string;
  created_at: string;
  updated_at?: string;
  cancellation_reason?: string;
  cancellation_details?: string;
  cancelled_at?: string;
  priority: string;
  duration: number;
  location: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-history-appointments',
  templateUrl: './history-appointments.component.html',
  styleUrls: ['./history-appointments.component.css'],
})
export class HistoryAppointmentsComponent implements OnInit {
  // ✅ PROPIEDADES
  patientHistory: AppointmentHistory[] = [];
  filteredHistory: AppointmentHistory[] = [];
  isLoading = true;
  showScrollIndicator = false;
  isScrolling = false;

  // ✅ FILTROS
  selectedStatus = '';
  selectedYear = '';
  selectedSpecialty = '';
  searchDoctor = '';

  // ✅ ESTADÍSTICAS
  totalAppointments = 0;
  completedAppointments = 0;
  cancelledAppointments = 0;
  noShowAppointments = 0;

  // ✅ DATOS AUXILIARES
  availableYears: string[] = [];
  availableSpecialties: string[] = [];
  patientId: string = '';

  // ✅ OPCIONES DE ESTADO
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'no_show', label: 'No asistí' },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'confirmed', label: 'Confirmadas' },
  ];

  constructor(
    private router: Router,
    private adminSvc: AdminService
  ) {}

  ngOnInit() {
    this.loadPatientInfo();
    this.loadPatientHistory();
  }

  // ✅ CARGAR INFORMACIÓN DEL PACIENTE
  loadPatientInfo() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.patientId = user.id;
      console.log('ID del paciente:', this.patientId);
    } else {
      console.error('No se encontró información del paciente');
      this.router.navigate(['/login']);
    }
  }

  loadPatientHistory() {
    this.isLoading = true;

    this.adminSvc.getAllAppointments().subscribe({
      next: (allAppointments: any[]) => {
        console.log('Todas las citas desde el servidor:', allAppointments);
        console.log('ID del paciente actual:', this.patientId);
        console.log('Tipo de ID del paciente:', typeof this.patientId);

        allAppointments.forEach((apt) => {
          console.log(
            `Cita ID: ${apt.id}, Patient_ID: ${apt.patient_id} (tipo: ${typeof apt.patient_id})`
          );
        });

        const patientAppointments = allAppointments.filter((apt) => {
          const aptPatientId = apt.patient_id.toString();
          const currentPatientId = this.patientId.toString();

          console.log(
            `Comparando: ${aptPatientId} === ${currentPatientId} = ${aptPatientId === currentPatientId}`
          );

          return aptPatientId === currentPatientId;
        });

        console.log(
          'Citas del paciente después del filtro:',
          patientAppointments
        );

        // Si aún no hay citas, intentar con comparación más flexible
        if (patientAppointments.length === 0) {
          console.log(
            '⚠️ No se encontraron citas con filtro estricto, probando filtro flexible...'
          );

          // Buscar citas que coincidan con el nombre del paciente
          const userFromStorage = localStorage.getItem('currentUser');
          if (userFromStorage) {
            const user = JSON.parse(userFromStorage);
            const patientName = user.name;

            const appointmentsByName = allAppointments.filter(
              (apt) =>
                apt.patient_name &&
                apt.patient_name
                  .toLowerCase()
                  .includes(patientName.toLowerCase())
            );

            console.log('Citas encontradas por nombre:', appointmentsByName);

            if (appointmentsByName.length > 0) {
              this.processAppointments(appointmentsByName);
              return;
            }
          }
        }

        this.processAppointments(patientAppointments);
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.isLoading = false;
      },
    });
  }

  processAppointments(patientAppointments: any[]) {
    // Mapear y formatear los datos
    this.patientHistory = patientAppointments.map((apt) => {
      let formattedDate = apt.date;

      // Formatear la fecha correctamente desde ISO a DD/MM/YYYY
      if (apt.date.includes('T')) {
        const date = new Date(apt.date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        formattedDate = `${day}/${month}/${year}`;
      } else if (apt.date.includes('-') && apt.date.length === 10) {
        // Convertir YYYY-MM-DD a DD/MM/YYYY
        const parts = apt.date.split('-');
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      return {
        id: apt.id,
        date: formattedDate,
        time: apt.time,
        physician: apt.physician_name || 'Médico no disponible',
        physician_specialty: apt.specialty || 'Especialidad no especificada',
        reason: apt.reason || 'Motivo no especificado',
        status: apt.status,
        notes: apt.notes || '',
        medical_notes: apt.medical_notes || '',
        preparation_notes: apt.preparation_notes || '',
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        cancellation_reason: apt.cancellation_reason || '',
        cancellation_details: apt.cancellation_details || '',
        cancelled_at: apt.cancelled_at,
        priority: apt.priority || 'normal',
        duration: apt.duration || 30,
        location: apt.location || 'Consulta externa',
      };
    });

    // Ordenar por fecha más reciente primero - usando la fecha original para el sorting
    this.patientHistory.sort((a, b) => {
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    this.calculateStats();
    this.extractFilterOptions();
    this.applyFilters();
    this.isLoading = false;

    console.log('Historial procesado final:', this.patientHistory);
  }

  // Método auxiliar para parsear fechas en formato DD/MM/YYYY
  private parseDate(dateString: string): Date {
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      return new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    } else if (dateString.includes('-')) {
      const parts = dateString.split('-');
      return new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
    }
    return new Date(dateString);
  }

  calculateStats() {
    this.totalAppointments = this.patientHistory.length;
    this.completedAppointments = this.patientHistory.filter(
      (apt) => apt.status === 'completed'
    ).length;
    this.cancelledAppointments = this.patientHistory.filter(
      (apt) => apt.status === 'cancelled'
    ).length;
    this.noShowAppointments = this.patientHistory.filter(
      (apt) => apt.status === 'no_show'
    ).length;
  }

  extractFilterOptions() {
    // Años disponibles - usar el método parseDate para un parsing consistente
    const years = [
      ...new Set(
        this.patientHistory.map((apt) =>
          this.parseDate(apt.date).getFullYear().toString()
        )
      ),
    ];
    this.availableYears = years.sort((a, b) => parseInt(b) - parseInt(a));

    // Especialidades disponibles
    const specialties = [
      ...new Set(this.patientHistory.map((apt) => apt.physician_specialty)),
    ];
    this.availableSpecialties = specialties
      .filter((spec) => spec && spec !== 'Especialidad no especificada')
      .sort();
  }

  ngAfterViewInit() {
    // ✅ NUEVO: Verificar si necesita mostrar indicador de scroll
    setTimeout(() => {
      this.checkScrollIndicator();
    }, 500);
  }

  // ✅ NUEVO: Verificar si hay contenido para hacer scroll
  checkScrollIndicator() {
    const appointmentsContent = document.querySelector('.appointments-content');
    if (appointmentsContent) {
      const hasScroll =
        appointmentsContent.scrollHeight > appointmentsContent.clientHeight;
      const isAtTop = appointmentsContent.scrollTop < 50;
      this.showScrollIndicator =
        hasScroll && isAtTop && this.filteredHistory.length > 3;
    }
  }

  // ✅ NUEVO: Manejar evento de scroll
  onScroll(event: any) {
    const element = event.target;
    const atTop = element.scrollTop < 50;
    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 50;

    // Ocultar indicador si no está en la parte superior
    this.showScrollIndicator =
      atTop &&
      this.filteredHistory.length > 3 &&
      element.scrollHeight > element.clientHeight;

    // Marcar como scrolleando para efectos visuales
    this.isScrolling = true;
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150);
  }

  private scrollTimeout: any;

  applyFilters() {
    this.filteredHistory = this.patientHistory.filter((apt) => {
      const matchesStatus =
        !this.selectedStatus || apt.status === this.selectedStatus;
      const matchesYear =
        !this.selectedYear ||
        this.parseDate(apt.date).getFullYear().toString() === this.selectedYear;
      const matchesSpecialty =
        !this.selectedSpecialty ||
        apt.physician_specialty === this.selectedSpecialty;
      const matchesDoctor =
        !this.searchDoctor ||
        apt.physician.toLowerCase().includes(this.searchDoctor.toLowerCase());

      return matchesStatus && matchesYear && matchesSpecialty && matchesDoctor;
    });

    console.log('Historial filtrado:', this.filteredHistory);

    // ✅ NUEVO: Verificar indicador después de filtrar
    setTimeout(() => {
      this.checkScrollIndicator();
    }, 100);
  }

  clearFilters() {
    this.selectedStatus = '';
    this.selectedYear = '';
    this.selectedSpecialty = '';
    this.searchDoctor = '';
    this.applyFilters();

    // Scroll hasta arriba
    setTimeout(() => {
      const appointmentsContent = document.querySelector(
        '.appointments-content'
      );
      if (appointmentsContent) {
        appointmentsContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  }

  // ✅ OBTENER TEXTO DE ESTADO
  getStatusText(status: string): string {
    const statusMap = {
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistí',
      scheduled: 'Programada',
      confirmed: 'Confirmada',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  }

  // ✅ OBTENER COLOR DE ESTADO
  getStatusColor(status: string): string {
    const colorMap = {
      completed: '#28a745',
      cancelled: '#dc3545',
      no_show: '#ffc107',
      scheduled: '#17a2b8',
      confirmed: '#007bff',
    };
    return colorMap[status as keyof typeof colorMap] || '#6c757d';
  }

  // ✅ OBTENER TEXTO DE PRIORIDAD
  getPriorityText(priority: string): string {
    const priorityMap = {
      urgent: 'Urgente',
      high: 'Alta',
      normal: 'Normal',
      low: 'Baja',
    };
    return priorityMap[priority as keyof typeof priorityMap] || 'Normal';
  }

  formatDate(dateString: string): string {
    // Manejar tanto fechas ISO como fechas en formato DD/MM/YYYY
    let date: Date;

    if (dateString.includes('T')) {
      // Fecha ISO (2024-01-15T09:00:00Z) - usar UTC para evitar problemas de zona horaria
      date = new Date(dateString);
    } else if (dateString.includes('/')) {
      // Fecha en formato DD/MM/YYYY
      const parts = dateString.split('/');
      date = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    } else if (dateString.includes('-')) {
      // Fecha en formato YYYY-MM-DD
      const parts = dateString.split('-');
      date = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
    } else {
      date = new Date(dateString);
    }

    const day = date.getDate();
    const monthNames = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day} de ${month} de ${year}`;
  }

  formatDateTime(dateString: string): string {
    // Manejar tanto fechas ISO como fechas en formato DD/MM/YYYY
    let date: Date;

    if (dateString.includes('T')) {
      // Fecha ISO (2024-01-15T09:00:00Z) - usar UTC para evitar problemas de zona horaria
      date = new Date(dateString);
    } else if (dateString.includes('/')) {
      // Fecha en formato DD/MM/YYYY
      const parts = dateString.split('/');
      date = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    } else if (dateString.includes('-')) {
      // Fecha en formato YYYY-MM-DD
      const parts = dateString.split('-');
      date = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
    } else {
      date = new Date(dateString);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  }

  goToPatientDashboard() {
    this.router.navigate(['/patient-dashboard']);
  }
  goToNewAppointment() {
    this.router.navigate(['/appointment-form']);
  }
}
