import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { MEDICAL_SPECIALTIES } from '../../../../constants/medical-specialties';
import {PhysicianService} from '../../../../services/physician.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface PatientDto {
  id: number;
  fullName: string;
  rut: string;
  email?: string;
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
  id?: number;
  date: string;
  time: string;
  physician: string;
  patient: string;
  patientId: number;
  physicianId: number;
  status?: string;
  isManageable: boolean;
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-appointment-form-assistant',
  templateUrl: './appointment-form-assistant.component.html',
  styleUrls: ['./appointment-form-assistant.component.css']
})
export class AppointmentFormAssistantComponent implements OnInit {
  newAppt = { patient_id: '', physician_id: '', date: '', time: '', reason: '', specialty: '' }; // ✅ Agregar specialty
  patients: PatientDto[] = [];
  physicians: PhysicianDto[] = [];
  allPhysicians: PhysicianDto[] = []; // ✅ Lista completa de médicos
  filteredPhysicians: PhysicianDto[] = []; // ✅ Médicos filtrados por especialidad
  specialtyCounts: SpecialtyCount[] = []; // ✅ Conteo por especialidad
  filteredPatients: PatientDto[] = [];
  appointments: AppointmentEvent[] = [];
  allAppointments: AppointmentEvent[] = []; // ✅ Para filtros
  filteredAppointments: AppointmentEvent[] = []; // ✅ Para filtros
  assistantId = '';
  currentUser: any = null;
  searchPatient = '';
  selectedSpecialty = ''; // ✅ Cambiar a usar newAppt.specialty
  showFiltered = false; // ✅ Para filtros

  medicalSpecialties = MEDICAL_SPECIALTIES;
  

  // Calendario
  currentDate = new Date();
  calendarDays: any[] = [];

  // Lista de especialidades médicas
  constructor(
    private adminSvc: AdminService,
    private authService: AuthService,
    private physicianService: PhysicianService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser && this.currentUser.id) {
      this.assistantId = this.currentUser.id.toString();

      console.log('Asistente autenticado:', this.currentUser);
      console.log('ID del asistente:', this.assistantId);

      this.loadPatients();
      this.loadPhysicians();
      this.loadAllAppointments();
      this.generateCalendar();
    } else {
      Swal.fire({
        title: 'Sesión Expirada',
        text: 'Debe iniciar sesión para gestionar citas',
        icon: 'warning',
        confirmButtonText: 'Ir a Login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

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
    console.log('🔄 Iniciando carga de médicos...');
    
    // ✅ Cargar médicos con especialidades usando physicianService
    this.physicianService.getAllPhysicians()
      .subscribe({
        next: (list: any[]) => {
          console.log('✅ Médicos recibidos desde el servidor:', list);
  
          if (!list || list.length === 0) {
            console.warn('⚠️ No se recibieron médicos del servidor');
            this.allPhysicians = [];
            this.filteredPhysicians = [];
            this.physicians = [];
            return;
          }
  
          // ✅ Mapear médicos correctamente
          this.allPhysicians = list.map(p => ({
            id: p.id,
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
            specialty: p.specialty || 'Sin especialidad'
          }));
  
          // ✅ Inicializar arrays de médicos
          this.physicians = [...this.allPhysicians];
          this.filteredPhysicians = [...this.allPhysicians]; // ✅ IMPORTANTE: Inicializar filteredPhysicians
  
          // ✅ Calcular conteos por especialidad
          this.calculateSpecialtyCounts();
  
          console.log('✅ Médicos procesados:', this.allPhysicians);
          console.log('✅ Médicos filtrados inicializados:', this.filteredPhysicians);
          console.log('✅ Conteos por especialidad:', this.specialtyCounts);
  
          // ✅ Si hay una especialidad preseleccionada, aplicar filtro
          if (this.newAppt.specialty) {
            this.onSpecialtyChange();
          }
        },
        error: (error) => {
          console.error('❌ Error cargando médicos:', error);
          
          // ✅ Inicializar arrays vacíos en caso de error
          this.allPhysicians = [];
          this.filteredPhysicians = [];
          this.physicians = [];
          this.specialtyCounts = [];
          
          Swal.fire({
            title: 'Error al cargar médicos',
            text: 'No se pudieron cargar los médicos. Verifique la conexión.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  // ✅ Calcular conteo de médicos por especialidad
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

  // Filtrar pacientes por búsqueda
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

  onSpecialtyChange() {
    console.log('🔍 Especialidad seleccionada:', this.newAppt.specialty);
    console.log('📋 Médicos disponibles para filtrar:', this.allPhysicians);
  
    if (this.newAppt.specialty && this.newAppt.specialty.trim() !== '') {
      // ✅ Filtrar médicos por especialidad seleccionada
      this.filteredPhysicians = this.allPhysicians.filter(p =>
        p.specialty === this.newAppt.specialty
      );
      console.log('✅ Médicos filtrados por especialidad:', this.filteredPhysicians);
    } else {
      // ✅ Si no hay especialidad, mostrar todos los médicos
      this.filteredPhysicians = [...this.allPhysicians];
      console.log('✅ Mostrando todos los médicos (sin filtro)');
    }
  
    // ✅ Limpiar selección de médico si no está en la nueva lista filtrada
    if (this.newAppt.physician_id) {
      const selectedPhysicianExists = this.filteredPhysicians.some(p =>
        p.id.toString() === this.newAppt.physician_id
      );
  
      if (!selectedPhysicianExists) {
        console.log('⚠️ Médico seleccionado no está en la especialidad, limpiando selección');
        this.newAppt.physician_id = '';
      }
    }
  
    // ✅ Aplicar filtros al calendario si están activos
    this.applyFilters();
    this.generateCalendar();
  }

  getFilteredPhysicians(): PhysicianDto[] {
    console.log('🎯 getFilteredPhysicians() ejecutándose...');
    console.log('🎯 Especialidad seleccionada:', this.newAppt.specialty);
    console.log('🎯 filteredPhysicians disponibles:', this.filteredPhysicians);
    console.log('🎯 allPhysicians disponibles:', this.allPhysicians);
  
    // ✅ Si hay especialidad seleccionada, usar médicos filtrados
    if (this.newAppt.specialty && this.newAppt.specialty.trim() !== '') {
      console.log('🎯 Retornando médicos filtrados:', this.filteredPhysicians);
      return this.filteredPhysicians;
    }
    
    // ✅ Si no hay especialidad, usar todos los médicos
    console.log('🎯 Retornando todos los médicos:', this.allPhysicians);
    return this.allPhysicians;
  }

  // Obtener médicos por especialidad
  getPhysiciansBySpecialty(): PhysicianDto[] {
    if (this.selectedSpecialty) {
      return this.physicians.filter(p => p.specialty === this.selectedSpecialty);
    }
    return this.physicians;
  }
  onPhysicianSelectionChange() {
    console.log('Médico seleccionado:', this.newAppt.physician_id);
    this.applyFilters();
    this.generateCalendar();
  }

  onPatientSelectionChange() {
    console.log('Paciente seleccionado:', this.newAppt.patient_id);
    this.applyFilters();
    this.generateCalendar();
  }


  applyFilters() {
    let filtered = [...this.allAppointments];
    let hasFilters = false;

    // Filtrar por paciente seleccionado
    if (this.newAppt.patient_id) {
      filtered = filtered.filter(apt => 
        apt.patientId.toString() === this.newAppt.patient_id
      );
      hasFilters = true;
      console.log('Filtrando por paciente ID:', this.newAppt.patient_id);
    }

    // Filtrar por médico seleccionado
    if (this.newAppt.physician_id) {
      filtered = filtered.filter(apt => 
        apt.physicianId.toString() === this.newAppt.physician_id
      );
      hasFilters = true;
      console.log('Filtrando por médico ID:', this.newAppt.physician_id);
    }

    // ✅ Nuevo: Filtrar por especialidad seleccionada
    if (this.newAppt.specialty && !this.newAppt.physician_id) {
      // Solo filtrar por especialidad si no hay médico específico seleccionado
      const physiciansInSpecialty = this.filteredPhysicians.map(p => p.id.toString());
      filtered = filtered.filter(apt => 
        physiciansInSpecialty.includes(apt.physicianId.toString())
      );
      hasFilters = true;
      console.log('Filtrando por especialidad:', this.newAppt.specialty);
    }

    this.filteredAppointments = filtered;
    this.showFiltered = hasFilters;

    // Usar citas filtradas si hay filtros activos, sino usar todas
    this.appointments = hasFilters ? this.filteredAppointments : this.allAppointments;

    console.log('Citas después del filtrado:', this.appointments);
    console.log('Filtros activos:', hasFilters);
  }

  // ✅ Actualizar clearFilters
  clearFilters() {
    this.newAppt.patient_id = '';
    this.newAppt.physician_id = '';
    this.newAppt.specialty = '';
    this.searchPatient = '';
    this.filteredPatients = [...this.patients];
    this.filteredPhysicians = [...this.allPhysicians];
    this.applyFilters();
    this.generateCalendar();
  }

  // ✅ Actualizar getFilterInfo para incluir especialidad
  getFilterInfo(): string {
    if (!this.showFiltered) return '';

    const parts = [];
    
    if (this.newAppt.specialty) {
      parts.push(`Especialidad: ${this.newAppt.specialty}`);
    }

    if (this.newAppt.physician_id) {
      const physician = this.allPhysicians.find(p => p.id.toString() === this.newAppt.physician_id);
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

    return parts.join(' | ');
  }

  loadAllAppointments() {
    console.log('Cargando TODAS las citas para el asistente');
    
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
              isManageable: true
            };
          });
          
          // ✅ Guardar todas las citas y aplicar filtros
          this.allAppointments = mappedAppointments;
          this.applyFilters();
          
          console.log('Array final de todas las citas:', this.allAppointments);
          this.generateCalendar();
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
        }
      });
  }


  getAssistantInfo(): string {
    if (this.currentUser) {
      return `${this.currentUser.name} ${this.currentUser.paternalLastName}`;
    }
    return 'Asistente';
  }

  generateCalendar() {
    console.log('Generando calendario para:', this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    console.log('Citas disponibles para mostrar:', this.appointments);
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
  
    this.calendarDays = [];
  
    // Días vacíos del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push({ day: '', isOtherMonth: true, appointments: [] });
    }
  
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      console.log(`Buscando citas para el día: ${dateString}`);
  
      const dayAppointments = this.appointments.filter(apt => {
        console.log(`Comparando: "${apt.date}" === "${dateString}"`);
        return apt.date === dateString;
      });
  
      // Ordenar citas por hora
      const sortedAppointments = dayAppointments.sort((a, b) => {
        return a.time.localeCompare(b.time);
      });
  
      // Mostrar solo las primeras 2 citas
      const visibleAppointments = sortedAppointments.slice(0, 2);
      const hasMoreAppointments = sortedAppointments.length > 2;
  
      const hasAppointments = sortedAppointments.length > 0;
  
      if (sortedAppointments.length > 0) {
        console.log(`✅ Día ${day} (${dateString}): ${sortedAppointments.length} cita(s)`);
      }
  
      this.calendarDays.push({
        day: day,
        isOtherMonth: false,
        dateString: dateString,
        appointments: visibleAppointments,
        allAppointments: sortedAppointments,
        hasMoreAppointments: hasMoreAppointments,
        totalAppointments: sortedAppointments.length,
        isToday: this.isToday(year, month, day),
        hasAppointments: hasAppointments
      });
    }
    
    const daysWithAppointments = this.calendarDays.filter(d => d.appointments?.length > 0);
    console.log('Días con citas en el calendario:', daysWithAppointments);
  }

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
      
      // ✅ Botones según el estado actual
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
          </div>
        `;
      } else if (apt.status === 'confirmed') {
        actionButtons = `
          <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
            <button onclick="completeAppointment(${apt.id})" 
                    style="background: #17a2b8; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✓ Completar
            </button>
            <button onclick="cancelAppointment(${apt.id})" 
                    style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ✗ Cancelar
            </button>
          </div>
        `;
      } else if (apt.status === 'cancelled') {
        actionButtons = `
          <div style="margin-top: 0.5rem;">
            <button onclick="reactivateAppointment(${apt.id})" 
                    style="background: #28a745; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">
              ↻ Reactivar
            </button>
          </div>
        `;
      }
      
      // ✅ Colores actualizados para todos los estados
      const bgColor = apt.status === 'cancelled' ? '#dc3545' : 
                      apt.status === 'completed' ? '#17a2b8' : 
                      apt.status === 'confirmed' ? '#28a745' : 
                      apt.status === 'no_show' ? '#ffc107' : '#6f42c1';
      
      const borderColor = apt.status === 'cancelled' ? '#a71e2a' : 
                         apt.status === 'completed' ? '#117a8b' : 
                         apt.status === 'confirmed' ? '#198754' : 
                         apt.status === 'no_show' ? '#e0a800' : '#5a2d91';
      
      
      return `
        <div class="modal-appointment-item" style="
          background: ${bgColor};
          color: ${apt.status === 'confirmed' ? 'black' : 'white'};
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
            📋 Estado: ${statusText || 'Programada'}
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

     // ✅ Actualizar las funciones globales
     (window as any).confirmAppointment = (appointmentId: number) => {
      console.log('🔄 Confirmando cita:', appointmentId);
      this.updateAppointmentStatus(appointmentId, 'confirmed');
      Swal.close();
    };
  
    (window as any).completeAppointment = (appointmentId: number) => {
      console.log('🔄 Completando cita:', appointmentId);
      this.updateAppointmentStatus(appointmentId, 'completed');
      Swal.close();
    };
  
    (window as any).markNoShow = (appointmentId: number) => {
      console.log('🔄 Marcando como no presentada:', appointmentId);
      this.updateAppointmentStatus(appointmentId, 'no_show');
      Swal.close();
    };
  
    // ✅ CORREGIR: NO cerrar el modal, dejarlo abierto para el proceso de cancelación
    (window as any).cancelAppointment = (appointmentId: number) => {
      console.log('🔄 Iniciando cancelación de cita:', appointmentId);
      this.cancelAppointmentWithReason(appointmentId);
      // ❌ NO cerrar aquí: Swal.close();
    };
  
    (window as any).reactivateAppointment = (appointmentId: number) => {
      console.log('🔄 Reactivando cita:', appointmentId);
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };

    Swal.fire({
      title: `📅 Citas del ${dateFormatted}`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p style="margin-bottom: 1rem; color: #666; text-align: center;">
            <strong>${calDay.allAppointments.length}</strong> cita(s) programada(s)
          </p>
          ${appointmentsHtml}
        </div>
      `,
      width: '700px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6f42c1',
      showCloseButton: true
    });
  }

  // ✅ Actualizar estado de cita
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
            text: `La cita ha sido ${statusTexts[status as keyof typeof statusTexts]} correctamente`,
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
  // ✅ Cancelar cita con motivo
  cancelAppointmentWithReason(appointmentId: number) {
    console.log('🔄 Iniciando proceso de cancelación para cita:', appointmentId);
    
    Swal.fire({
      title: 'Cancelar Cita',
      text: 'Seleccione el motivo de cancelación:',
      input: 'select',
      inputOptions: {
        'patient_request': 'Solicitud del paciente',
        'physician_unavailable': 'Médico no disponible',
        'emergency': 'Emergencia médica',
        'administrative': 'Motivos administrativos',
        'schedule_conflict': 'Conflicto de horarios',
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
      console.log('📝 Resultado de selección de motivo:', result);
      
      if (result.isConfirmed) {
        if (result.value === 'other') {
          // Solicitar detalles adicionales
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
              console.log('📝 Cancelando con motivo personalizado:', reasonResult.value);
              this.cancelAppointmentWithDetails(appointmentId, 'other', reasonResult.value);
            }
          });
        } else {
          console.log('📝 Cancelando con motivo predefinido:', result.value);
          this.cancelAppointmentWithDetails(appointmentId, result.value, '');
        }
      } else {
        console.log('❌ Cancelación abortada por el usuario');
      }
    });
  }

  // ✅ Cancelar con detalles específicos
  // ✅ Actualizar para cerrar el modal correcto después de completar la cancelación
  cancelAppointmentWithDetails(appointmentId: number, reason: string, details: string) {
    const cancelData = {
      status: 'cancelled',
      cancellation_reason: reason,
      cancellation_details: details,
      cancelled_by: this.assistantId,
      cancelled_at: new Date().toISOString()
    };

    console.log('📤 Enviando datos de cancelación:', cancelData);

    this.adminSvc.cancelAppointment(appointmentId, cancelData)
      .subscribe({
        next: (response) => {
          console.log('✅ Cita cancelada exitosamente:', response);
          this.loadAllAppointments(); // Recargar calendario
          
          // ✅ Cerrar cualquier modal abierto y mostrar confirmación
          Swal.close();
          
          Swal.fire({
            title: '¡Cita cancelada!',
            text: 'La cita ha sido cancelada y se notificará a los involucrados',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000
          });
        },
        error: (error) => {
          console.error('❌ Error cancelando cita:', error);
          
          // ✅ Cerrar modal de cancelación y mostrar error
          Swal.close();
          
          Swal.fire({
            title: 'Error',
            text: 'No se pudo cancelar la cita. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

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
  
    // ✅ VALIDACIÓN CORREGIDA: Usar directamente los strings de fecha
    const selectedDateStr = this.newAppt.date; // Formato: "YYYY-MM-DD"
    const todayStr = new Date().toISOString().split('T')[0]; // Formato: "YYYY-MM-DD"
    
    console.log('Fecha seleccionada:', selectedDateStr);
    console.log('Fecha de hoy:', todayStr);
  
    // ✅ Comparar strings directamente
    if (selectedDateStr < todayStr) {
      Swal.fire({
        title: 'Error',
        text: 'No puede agendar citas en fechas pasadas',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    // ✅ Si es HOY, validar que la hora no haya pasado
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
  
    console.log('Enviando cita desde asistente:', this.newAppt);
    
    // ✅ Guardar los filtros actuales antes de limpiar el formulario
    const currentPatientId = this.newAppt.patient_id;
    const currentPhysicianId = this.newAppt.physician_id;
    const currentSpecialty = this.newAppt.specialty;
    
    this.adminSvc.createAppointment(this.newAppt)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          
          // ✅ Restaurar filtros después de crear la cita
          this.newAppt = { 
            patient_id: currentPatientId, 
            physician_id: currentPhysicianId, 
            specialty: currentSpecialty,
            date: '', 
            time: '', 
            reason: '' 
          };
          
          this.loadAllAppointments();
          
          Swal.fire({
            title: '¡Cita creada con éxito!',
            text: 'La cita ha sido agendada correctamente',
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

  isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return today.getFullYear() === year && 
           today.getMonth() === month && 
           today.getDate() === day;
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
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  goToAssistantDashboard() {
    this.router.navigate(['/assistant-dashboard']);
  }
}