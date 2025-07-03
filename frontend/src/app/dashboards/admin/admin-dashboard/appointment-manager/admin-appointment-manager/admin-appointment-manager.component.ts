// admin-appointment-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../../services/admin.service';
import { PhysicianService } from '../../../../../services/physician.service';
import { AuthService } from '../../../../../services/auth.service';
import { MEDICAL_SPECIALTIES } from '../../../../../constants/medical-specialties';
import Swal from 'sweetalert2';

interface PatientDto {
  id: number;
  fullName: string;
  rut: string;
  email: string;
}

interface PhysicianDto {
  id: number;
  fullName: string;
  specialty: string;
}

interface SpecialtyCount {
  specialty: string;
  count: number;
}

interface AppointmentEvent {
  id: number;
  date: string;
  time: string;
  physician: string;
  patient: string;
  patientId: number;
  physicianId: number;
  status: string;
  isManageable: boolean;
  cancellation_reason?: string;
  cancellation_details?: string;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-admin-appointment-manager',
  templateUrl: './admin-appointment-manager.component.html',
  styleUrls: ['./admin-appointment-manager.component.css']
})
export class AdminAppointmentManagerComponent implements OnInit {
  // ✅ FORMULARIO COMPLETO
  newAppt = { 
    patient_id: '', 
    physician_id: '', 
    date: '', 
    time: '', 
    reason: '', 
    specialty: '',
    priority: 'normal', // ✅ Nuevo: Prioridad
    notes: '' // ✅ Nuevo: Notas administrativas
  };

  // ✅ DATOS COMPLETOS
  patients: PatientDto[] = [];
  physicians: PhysicianDto[] = [];
  allPhysicians: PhysicianDto[] = [];
  filteredPhysicians: PhysicianDto[] = [];
  specialtyCounts: SpecialtyCount[] = [];
  filteredPatients: PatientDto[] = [];
  appointments: AppointmentEvent[] = [];
  allAppointments: AppointmentEvent[] = [];
  filteredAppointments: AppointmentEvent[] = [];

  // ✅ FILTROS AVANZADOS
  searchPatient = '';
  selectedPhysician = '';
  selectedStatus = '';
  selectedSpecialty = '';
  dateFrom = '';
  dateTo = '';
  showFiltered = false;

  // ✅ DATOS DE ADMIN
  adminId = '';
  currentUser: any = null;

  // ✅ CALENDARIO Y VISTA
  currentDate = new Date();
  calendarDays: any[] = [];
  viewMode = 'calendar'; // 'calendar' | 'list'
  
  medicalSpecialties = MEDICAL_SPECIALTIES;
  appointmentStatuses = [
    { value: 'scheduled', label: 'Programada' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'no_show', label: 'No se presentó' }
  ];

  priorityLevels = [
    { value: 'urgent', label: 'Urgente', color: '#dc3545' },
    { value: 'high', label: 'Alta', color: '#fd7e14' },
    { value: 'normal', label: 'Normal', color: '#28a745' },
    { value: 'low', label: 'Baja', color: '#6c757d' }
  ];

  constructor(
    private adminSvc: AdminService,
    private authService: AuthService,
    private physicianService: PhysicianService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser && this.currentUser.id) {
      this.adminId = this.currentUser.id.toString();

      console.log('Admin autenticado:', this.currentUser);
      console.log('ID del admin:', this.adminId);

      this.loadPatients();
      this.loadPhysicians();
      this.loadAllAppointments();
      this.generateCalendar();
    } else {
      Swal.fire({
        title: 'Sesión Expirada',
        text: 'Debe iniciar sesión para gestionar citas',
        icon: 'warning',
        confirmButtonText: 'Ir al Login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  // ✅ CARGA DE DATOS
  private loadPatients() {
    this.adminSvc.getAllPatients()
      .subscribe({
        next: (list: any[]) => {
          console.log('Pacientes desde el servidor:', list);
          
          this.patients = list.map(p => ({
            id: p.id,
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
            rut: p.rut,
            email: p.email
          }));

          this.filteredPatients = [...this.patients];
          console.log('Pacientes procesados:', this.patients);
        },
        error: (error) => {
          console.error('Error cargando pacientes:', error);
        }
      });
  }

  private loadPhysicians() {
    this.physicianService.getAllPhysicians()
      .subscribe({
        next: (list: any[]) => {
          console.log('Médicos desde el servidor:', list);
          
          this.allPhysicians = list.map(p => ({
            id: p.id,
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
            specialty: p.specialty || 'Sin especialidad'
          }));

          this.physicians = [...this.allPhysicians];
          this.filteredPhysicians = [...this.allPhysicians];
          this.calculateSpecialtyCounts();

          console.log('Médicos procesados:', this.allPhysicians);
        },
        error: (error) => {
          console.error('Error cargando médicos:', error);
        }
      });
  }

  loadAllAppointments() {
    console.log('Cargando TODAS las citas para administrador');
    
    this.adminSvc.getAllAppointments()
      .subscribe({
        next: (list: any[]) => {
          console.log('Todas las citas desde el servidor:', list);
          
          const mappedAppointments = list.map(a => {
            let formattedDate = a.date;
            if (a.date.includes('T')) {
              formattedDate = a.date.split('T')[0];
            }
            
            return {
              id: a.id,
              date: formattedDate,
              time: a.time,
              physician: a.physician_name || 'Sin nombre',
              patient: a.patient_name || 'Sin nombre',
              patientId: a.patient_id,
              physicianId: a.physician_id,
              status: a.status,
              isManageable: true,
              cancellation_reason: a.cancellation_reason,
              cancellation_details: a.cancellation_details,
              priority: a.priority || 'normal',
              notes: a.notes || ''
            };
          });
          
          this.allAppointments = mappedAppointments;
          this.applyFilters();
          
          console.log('Array final de todas las citas:', this.allAppointments);
          this.generateCalendar();
          
          // ✅ NUEVO: Verificar scroll después de cargar datos
          if (this.viewMode === 'list') {
            setTimeout(() => {
              this.checkScrollNeeded();
            }, 200);
          }
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
        }
      });
  }

  // ✅ FILTROS AVANZADOS
  calculateSpecialtyCounts() {
    const counts: { [key: string]: number } = {};

    this.allPhysicians.forEach(physician => {
      if (physician.specialty) {
        counts[physician.specialty] = (counts[physician.specialty] || 0) + 1;
      }
    });

    this.specialtyCounts = Object.keys(counts).map(specialty => ({
      specialty,
      count: counts[specialty]
    }));
  }

  getPhysicianCount(specialty: string): number {
    const specialtyCount = this.specialtyCounts.find(sc => sc.specialty === specialty);
    return specialtyCount ? specialtyCount.count : 0;
  }

  onSpecialtyChange() {
    console.log('Especialidad seleccionada:', this.newAppt.specialty);

    if (this.newAppt.specialty) {
      this.filteredPhysicians = this.allPhysicians.filter(p =>
        p.specialty === this.newAppt.specialty
      );
    } else {
      this.filteredPhysicians = [...this.allPhysicians];
    }

    // Limpiar selección de médico si no está en la nueva lista filtrada
    if (this.newAppt.physician_id) {
      const selectedPhysicianExists = this.filteredPhysicians.some(p =>
        p.id.toString() === this.newAppt.physician_id
      );

      if (!selectedPhysicianExists) {
        this.newAppt.physician_id = '';
      }
    }

    this.applyFilters();
    this.generateCalendar();
  }

  onPatientSearch() {
    if (this.searchPatient.trim()) {
      this.filteredPatients = this.patients.filter(p => 
        p.fullName.toLowerCase().includes(this.searchPatient.toLowerCase()) ||
        p.rut.includes(this.searchPatient)
      );
    } else {
      this.filteredPatients = [...this.patients];
    }
  }

  // ✅ FILTROS AVANZADOS PARA ADMIN
  applyFilters() {
    let filtered = [...this.allAppointments];
    let hasFilters = false;

    // Filtrar por paciente
    if (this.newAppt.patient_id) {
      filtered = filtered.filter(apt => 
        apt.patientId.toString() === this.newAppt.patient_id
      );
      hasFilters = true;
    }

    // Filtrar por médico
    if (this.selectedPhysician) {
      filtered = filtered.filter(apt => 
        apt.physicianId.toString() === this.selectedPhysician
      );
      hasFilters = true;
    }

    // Filtrar por especialidad
    if (this.selectedSpecialty && !this.selectedPhysician) {
      const physiciansInSpecialty = this.allPhysicians
        .filter(p => p.specialty === this.selectedSpecialty)
        .map(p => p.id.toString());
      filtered = filtered.filter(apt => 
        physiciansInSpecialty.includes(apt.physicianId.toString())
      );
      hasFilters = true;
    }

    // Filtrar por estado
    if (this.selectedStatus) {
      filtered = filtered.filter(apt => apt.status === this.selectedStatus);
      hasFilters = true;
    }

    // Filtrar por rango de fechas
    if (this.dateFrom) {
      filtered = filtered.filter(apt => apt.date >= this.dateFrom);
      hasFilters = true;
    }

    if (this.dateTo) {
      filtered = filtered.filter(apt => apt.date <= this.dateTo);
      hasFilters = true;
    }

    this.filteredAppointments = filtered;
    this.showFiltered = hasFilters;
    this.appointments = hasFilters ? this.filteredAppointments : this.allAppointments;

    console.log('Citas después del filtrado:', this.appointments);
  }

  // ✅ GESTIÓN COMPLETA DE CITAS
  getFilteredPhysicians(): PhysicianDto[] {
    return this.filteredPhysicians.length > 0 ? this.filteredPhysicians : this.allPhysicians;
  }

  onPhysicianSelectionChange() {
    this.selectedPhysician = this.newAppt.physician_id;
    this.applyFilters();
    this.generateCalendar();
  }

  onPatientSelectionChange() {
    this.applyFilters();
    this.generateCalendar();
  }

  onStatusFilterChange() {
    this.applyFilters();
    this.generateCalendar();
  }

  onSpecialtyFilterChange() {
    this.applyFilters();
    this.generateCalendar();
  }

  onDateFilterChange() {
    this.applyFilters();
    this.generateCalendar();
  }

  clearFilters() {
    this.newAppt.patient_id = '';
    this.newAppt.physician_id = '';
    this.newAppt.specialty = '';
    this.selectedPhysician = '';
    this.selectedStatus = '';
    this.selectedSpecialty = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.searchPatient = '';
    this.filteredPatients = [...this.patients];
    this.filteredPhysicians = [...this.allPhysicians];
    this.applyFilters();
    this.generateCalendar();
  }

  // ✅ INFORMACIÓN DEL FILTRO
  getFilterInfo(): string {
    if (!this.showFiltered) return '';

    const parts = [];
    
    if (this.selectedSpecialty) {
      parts.push(`Especialidad: ${this.selectedSpecialty}`);
    }

    if (this.selectedPhysician) {
      const physician = this.allPhysicians.find(p => p.id.toString() === this.selectedPhysician);
      if (physician) {
        parts.push(`Médico: Dr. ${physician.fullName}`);
      }
    }
    
    if (this.newAppt.patient_id) {
      const patient = this.patients.find(p => p.id.toString() === this.newAppt.patient_id);
      if (patient) {
        parts.push(`Paciente: ${patient.fullName}`);
      }
    }

    if (this.selectedStatus) {
      const status = this.appointmentStatuses.find(s => s.value === this.selectedStatus);
      if (status) {
        parts.push(`Estado: ${status.label}`);
      }
    }

    if (this.dateFrom && this.dateTo) {
      parts.push(`Fechas: ${this.dateFrom} - ${this.dateTo}`);
    } else if (this.dateFrom) {
      parts.push(`Desde: ${this.dateFrom}`);
    } else if (this.dateTo) {
      parts.push(`Hasta: ${this.dateTo}`);
    }

    return parts.join(' | ');
  }

  // ✅ CREAR CITA CON VALIDACIONES AVANZADAS
  submit() {
    if (!this.newAppt.patient_id || !this.newAppt.physician_id || !this.newAppt.date || !this.newAppt.time) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos obligatorios',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Validación de fechas y horas
    const selectedDateStr = this.newAppt.date;
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (selectedDateStr < todayStr) {
      Swal.fire({
        title: 'Error',
        text: 'No puede agendar citas en fechas pasadas',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (selectedDateStr === todayStr) {
      const [hour, minute] = this.newAppt.time.split(':').map(Number);
      const now = new Date();
      
      if (hour < now.getHours() || (hour === now.getHours() && minute <= now.getMinutes())) {
        Swal.fire({
          title: 'Error',
          text: 'No puede agendar una cita en una hora que ya pasó',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        return;
      }
    }

    console.log('Enviando cita desde administrador:', this.newAppt);
    
    // Guardar filtros actuales
    const currentFilters = {
      patient_id: this.newAppt.patient_id,
      physician_id: this.newAppt.physician_id,
      specialty: this.newAppt.specialty,
      selectedPhysician: this.selectedPhysician,
      selectedStatus: this.selectedStatus,
      selectedSpecialty: this.selectedSpecialty
    };
    
    this.adminSvc.createAppointment(this.newAppt)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          // Restaurar solo algunos filtros
          this.newAppt = { 
            patient_id: currentFilters.patient_id, 
            physician_id: currentFilters.physician_id, 
            specialty: currentFilters.specialty,
            date: '', 
            time: '', 
            reason: '',
            priority: 'normal',
            notes: ''
          };
          
          this.loadAllAppointments();
          
          Swal.fire({
            title: '¡Cita creada con éxito!',
            text: 'La cita ha sido agendada correctamente por el administrador',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error) => {
          console.error('Error al crear cita:', error);
          
          if (error.status === 409) {
            Swal.fire({
              title: 'Horario no disponible',
              text: 'El médico ya tiene una cita agendada en esa fecha y hora. Por favor seleccione otro horario.',
              icon: 'warning',
              confirmButtonText: 'Aceptar'
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo crear la cita. Intente nuevamente.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        }
      });
  }

  // ✅ GESTIÓN DE ESTADOS (TODAS LAS OPCIONES)
  updateAppointmentStatus(appointmentId: number, status: string) {
    const statusTexts = {
      'completed': 'completada',
      'cancelled': 'cancelada',
      'scheduled': 'reactivada',
      'confirmed': 'confirmada',
      'no_show': 'marcada como no presentada'
    };

    this.adminSvc.updateAppointmentStatus(appointmentId, status)
      .subscribe({
        next: (response) => {
          console.log('Estado actualizado:', response);
          this.loadAllAppointments();
          Swal.fire({
            title: '¡Estado actualizado!',
            text: `La cita ha sido ${statusTexts[status as keyof typeof statusTexts]} por el administrador`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 2000
          });
        },
        error: (error) => {
          console.error('Error actualizando estado:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el estado de la cita',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  // ✅ CANCELACIÓN AVANZADA
  cancelAppointmentWithReason(appointmentId: number) {
    console.log('Iniciando proceso de cancelación para cita:', appointmentId);
    
    Swal.fire({
      title: 'Cancelar Cita',
      text: 'Como administrador, seleccione el motivo de cancelación:',
      input: 'select',
      inputOptions: {
        'administrative_decision': 'Decisión administrativa',
        'patient_request': 'Solicitud del paciente',
        'physician_unavailable': 'Médico no disponible',
        'emergency': 'Emergencia médica',
        'schedule_conflict': 'Conflicto de horarios',
        'system_maintenance': 'Mantenimiento del sistema',
        'force_majeure': 'Fuerza mayor',
        'other': 'Otro motivo'
      },
      inputPlaceholder: 'Seleccione un motivo',
      showCancelButton: true,
      confirmButtonText: 'Cancelar Cita',
      cancelButtonText: 'Mantener Cita',
      confirmButtonColor: '#dc3545',
      inputValidator: (value) => {
        if (!value) {
          return 'Debe seleccionar un motivo';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === 'other') {
          Swal.fire({
            title: 'Especifique el motivo',
            input: 'textarea',
            inputPlaceholder: 'Describa el motivo de cancelación...',
            showCancelButton: true,
            confirmButtonText: 'Cancelar Cita',
            cancelButtonText: 'Volver',
            confirmButtonColor: '#dc3545',
            inputValidator: (value) => {
              if (!value || value.trim().length < 5) {
                return 'Debe especificar el motivo (mínimo 5 caracteres)';
              }
              return null;
            }
          }).then((reasonResult) => {
            if (reasonResult.isConfirmed) {
              this.cancelAppointmentWithDetails(appointmentId, 'other', reasonResult.value);
            }
          });
        } else {
          this.cancelAppointmentWithDetails(appointmentId, result.value, '');
        }
      }
    });
  }

  cancelAppointmentWithDetails(appointmentId: number, reason: string, details: string) {
    const cancelData = {
      status: 'cancelled',
      cancellation_reason: reason,
      cancellation_details: details,
      cancelled_by: this.adminId,
      cancelled_at: new Date().toISOString()
    };

    console.log('Enviando datos de cancelación:', cancelData);

    this.adminSvc.cancelAppointment(appointmentId, cancelData)
      .subscribe({
        next: (response) => {
          console.log('Cita cancelada exitosamente:', response);
          this.loadAllAppointments();
          
          Swal.fire({
            title: '¡Cita cancelada!',
            text: 'La cita ha sido cancelada por el administrador y se notificará a los involucrados',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000
          });
        },
        error: (error) => {
          console.error('Error cancelando cita:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cancelar la cita. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  // ✅ HERRAMIENTAS ADICIONALES DE ADMIN
  getAdminInfo(): string {
    if (this.currentUser) {
      return `${this.currentUser.name || 'Admin'} ${this.currentUser.paternalLastName || ''}`.trim();
    }
    return 'Administrador';
  }

  goToAdminDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];

    // Días anteriores al mes actual
    for (let date = new Date(startDate); date < firstDay; date.setDate(date.getDate() + 1)) {
      this.calendarDays.push({
        day: date.getDate(),
        isOtherMonth: true,
        dateString: date.toISOString().split('T')[0],
        appointments: [],
        allAppointments: []
      });
    }

    // Días del mes actual
    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayAppointments = this.appointments.filter(apt => apt.date === dateString);
      const sortedAppointments = dayAppointments.sort((a, b) => a.time.localeCompare(b.time));
      const visibleAppointments = sortedAppointments.slice(0, 3);
      const hasMoreAppointments = sortedAppointments.length > 3;

      // Análisis de tipos de citas para el admin
      const hasScheduled = sortedAppointments.some(apt => apt.status === 'scheduled');
      const hasConfirmed = sortedAppointments.some(apt => apt.status === 'confirmed');
      const hasCompleted = sortedAppointments.some(apt => apt.status === 'completed');
      const hasCancelled = sortedAppointments.some(apt => apt.status === 'cancelled');
      const hasNoShow = sortedAppointments.some(apt => apt.status === 'no_show');

      this.calendarDays.push({
        day: day,
        isOtherMonth: false,
        dateString: dateString,
        appointments: visibleAppointments,
        allAppointments: sortedAppointments,
        hasMoreAppointments: hasMoreAppointments,
        totalAppointments: sortedAppointments.length,
        hasScheduled,
        hasConfirmed,
        hasCompleted,
        hasCancelled,
        hasNoShow,
        isDayWithAppointments: sortedAppointments.length > 0,
        isToday: this.isToday(year, month, day)
      });
    }

    // Días posteriores al mes actual
    for (let date = new Date(lastDay); date < endDate; date.setDate(date.getDate() + 1)) {
      if (date > lastDay) {
        this.calendarDays.push({
          day: date.getDate(),
          isOtherMonth: true,
          dateString: date.toISOString().split('T')[0],
          appointments: [],
          allAppointments: []
        });
      }
    }
  }

  // ✅ MOSTRAR DETALLES DEL DÍA CON FUNCIONES DE ADMIN
  showDayDetails(calDay: any) {
    if (!calDay.allAppointments || calDay.allAppointments.length === 0) {
      return;
    }

    const appointmentsHtml = calDay.allAppointments.map((apt: any) => {
      const statusText = apt.status === 'cancelled' ? ' (Cancelada)' : 
                        apt.status === 'completed' ? ' (Completada)' : 
                        apt.status === 'confirmed' ? ' (Confirmada)' : 
                        apt.status === 'no_show' ? ' (No se presentó)' : 
                        ' (Programada)';
      
      // ✅ TODAS las opciones para ADMIN
      let actionButtons = '';
      if (apt.status === 'scheduled') {
        actionButtons = `
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button onclick="confirmAppointment(${apt.id})" 
                    style="background: #28a745; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✓ Confirmar
            </button>
            <button onclick="completeAppointment(${apt.id})" 
                    style="background: #17a2b8; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✓ Completar
            </button>
            <button onclick="markNoShow(${apt.id})" 
                    style="background: #ffc107; color: black; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ⚠ No vino
            </button>
            <button onclick="cancelAppointment(${apt.id})" 
                    style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✗ Cancelar
            </button>
            <button onclick="editAppointment(${apt.id})" 
                    style="background: #6f42c1; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✏️ Editar
            </button>
          </div>
        `;
      } else if (apt.status === 'confirmed') {
        actionButtons = `
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button onclick="completeAppointment(${apt.id})" 
                    style="background: #17a2b8; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✓ Completar
            </button>
            <button onclick="markNoShow(${apt.id})" 
                    style="background: #ffc107; color: black; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ⚠ No vino
            </button>
            <button onclick="cancelAppointment(${apt.id})" 
                    style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✗ Cancelar
            </button>
            <button onclick="editAppointment(${apt.id})" 
                    style="background: #6f42c1; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✏️ Editar
            </button>
          </div>
        `;
      } else if (apt.status === 'cancelled') {
        actionButtons = `
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button onclick="reactivateAppointment(${apt.id})" 
                    style="background: #28a745; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ↻ Reactivar
            </button>
            <button onclick="deleteAppointment(${apt.id})" 
                    style="background: #6c757d; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              🗑️ Eliminar
            </button>
          </div>
        `;
      } else if (apt.status === 'completed') {
        actionButtons = `
          <div style="margin-top: 0.5rem;">
            <button onclick="viewDetails(${apt.id})" 
                    style="background: #17a2b8; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              👁️ Ver detalles
            </button>
          </div>
        `;
      } else if (apt.status === 'no_show') {
        actionButtons = `
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button onclick="reactivateAppointment(${apt.id})" 
                    style="background: #28a745; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ↻ Reactivar
            </button>
            <button onclick="completeAppointment(${apt.id})" 
                    style="background: #17a2b8; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✓ Marcar Completada
            </button>
          </div>
        `;
      }
      
      // Colores por estado
      const bgColor = apt.status === 'cancelled' ? '#dc3545' : 
                      apt.status === 'completed' ? '#17a2b8' : 
                      apt.status === 'confirmed' ? '#28a745' : 
                      apt.status === 'no_show' ? '#ffc107' : '#0d6efd';
      
      const borderColor = apt.status === 'cancelled' ? '#a71e2a' : 
                         apt.status === 'completed' ? '#117a8b' : 
                         apt.status === 'confirmed' ? '#198754' : 
                         apt.status === 'no_show' ? '#e0a800' : '#0d6efd';

      return `
        <div class="modal-appointment-item" style="
          background: ${bgColor};
          color: ${apt.status === 'no_show' ? 'black' : 'white'};
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 6px;
          border-left: 4px solid ${borderColor};
        ">
          <div style="font-weight: bold; font-size: 1rem;">
            🕐 ${apt.time}
          </div>
          <div style="margin-top: 0.25rem;">
            👤 ${apt.patient}
          </div>
          <div style="margin-top: 0.25rem;">
            👨‍⚕️ Dr. ${apt.physician}
          </div>
          <div style="margin-top: 0.25rem; font-size: 0.9rem; opacity: 0.9;">
            📋 Estado: ${statusText}
          </div>
          <div style="margin-top: 0.25rem; font-size: 0.85rem; opacity: 0.9;">
            🆔 ID: ${apt.id}
          </div>
          ${actionButtons}
        </div>
      `;
    }).join('');

    const dateFormatted = new Date(calDay.dateString + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // ✅ FUNCIONES GLOBALES PARA ADMIN
    (window as any).confirmAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'confirmed');
      Swal.close();
    };

    (window as any).completeAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'completed');
      Swal.close();
    };

    (window as any).markNoShow = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'no_show');
      Swal.close();
    };

    (window as any).cancelAppointment = (appointmentId: number) => {
      this.cancelAppointmentWithReason(appointmentId);
    };

    (window as any).reactivateAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };

    (window as any).editAppointment = (appointmentId: number) => {
      this.editAppointment(appointmentId);
      Swal.close();
    };

    (window as any).deleteAppointment = (appointmentId: number) => {
      this.deleteAppointment(appointmentId);
      Swal.close();
    };

    (window as any).viewDetails = (appointmentId: number) => {
      this.viewAppointmentDetails(appointmentId);
      Swal.close();
    };

    Swal.fire({
      title: `📅 Citas del ${dateFormatted} (Admin)`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p style="margin-bottom: 1rem; color: #666; text-align: center;">
            <strong>${calDay.allAppointments.length}</strong> cita(s) programada(s)
          </p>
          ${appointmentsHtml}
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#0d6efd',
      showCloseButton: true
    });
  }

  // ✅ FUNCIONES ADICIONALES DE ADMIN
  editAppointment(appointmentId: number) {
    // Implementar edición de cita
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      // Prellenar el formulario con los datos de la cita
      this.newAppt.patient_id = appointment.patientId.toString();
      this.newAppt.physician_id = appointment.physicianId.toString();
      this.newAppt.date = appointment.date;
      this.newAppt.time = appointment.time;
      
      Swal.fire({
        title: 'Editando Cita',
        text: 'Los datos de la cita han sido cargados en el formulario. Realice los cambios necesarios y guarde.',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
    }
  }

  deleteAppointment(appointmentId: number) {
    Swal.fire({
      title: '¿Eliminar cita permanentemente?',
      text: 'Esta acción no se puede deshacer. La cita será eliminada del sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminSvc.deleteAppointment(appointmentId)
          .subscribe({
            next: () => {
              this.loadAllAppointments();
              Swal.fire({
                title: 'Cita eliminada',
                text: 'La cita ha sido eliminada permanentemente del sistema',
                icon: 'success',
                confirmButtonText: 'Aceptar'
              });
            },
            error: (error) => {
              console.error('Error eliminando cita:', error);
              Swal.fire({
                title: 'Error',
                text: 'No se pudo eliminar la cita',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
      }
    });
  }

  viewAppointmentDetails(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      Swal.fire({
        title: `Detalles de la Cita #${appointmentId}`,
        html: `
          <div style="text-align: left;">
            <p><strong>Paciente:</strong> ${appointment.patient}</p>
            <p><strong>Médico:</strong> Dr. ${appointment.physician}</p>
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Estado:</strong> ${appointment.status}</p>
            ${appointment.cancellation_reason ? `<p><strong>Motivo cancelación:</strong> ${appointment.cancellation_reason}</p>` : ''}
            ${appointment.cancellation_details ? `<p><strong>Detalles:</strong> ${appointment.cancellation_details}</p>` : ''}
          </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#0d6efd'
      });
    }
  }

  // ✅ MÉTODOS DE NAVEGACIÓN
  isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return year === today.getFullYear() && 
           month === today.getMonth() && 
           day === today.getDate();
  }

  previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  // ✅ CAMBIO DE VISTA
  setViewMode(mode: string) {
    this.viewMode = mode;
    if (mode === 'list') {
      setTimeout(() => {
        this.checkScrollNeeded();
      }, 100);
    }
  }
  
  checkScrollNeeded() {
    const listElement = document.querySelector('.appointments-list');
    if (listElement) {
      const hasScroll = listElement.scrollHeight > listElement.clientHeight;
      if (hasScroll) {
        listElement.classList.add('has-scroll');
      } else {
        listElement.classList.remove('has-scroll');
      }
    }
  }
  // ✅ EXPORTAR DATOS
  exportAppointments() {
    Swal.fire({
      title: 'Exportar Citas',
      text: 'Funcionalidad de exportación próximamente disponible.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0d6efd'
    });
  }

  // ✅ ESTADÍSTICAS RÁPIDAS
  getAppointmentStats() {
    const total = this.appointments.length;
    const scheduled = this.appointments.filter(apt => apt.status === 'scheduled').length;
    const confirmed = this.appointments.filter(apt => apt.status === 'confirmed').length;
    const completed = this.appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = this.appointments.filter(apt => apt.status === 'cancelled').length;
    const noShow = this.appointments.filter(apt => apt.status === 'no_show').length;

    return {
      total,
      scheduled,
      confirmed,
      completed,
      cancelled,
      noShow
    };
  }
}
