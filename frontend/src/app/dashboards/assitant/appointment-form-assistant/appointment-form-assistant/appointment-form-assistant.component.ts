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
  reason?: string;                    // Motivo de la consulta
  specialty?: string;                 // Especialidad médica
  priority?: string;                  // Prioridad (normal, urgent, etc.)
  notes?: string;                     // Notas administrativas
  created_at?: string;               // Cuándo se creó la cita
  updated_at?: string;               // Última actualización
  cancellation_reason?: string;      // Motivo de cancelación
  cancellation_details?: string;     // Detalles de cancelación
  cancelled_by?: string;             // Quién canceló
  cancelled_at?: string;             // Cuándo se canceló
  patient_phone?: string;            // Teléfono del paciente
  patient_email?: string;            // Email del paciente
  duration?: number;                 // Duración estimada en minutos
  location?: string;                 // Ubicación de la consulta
  preparation_notes?: string;        // Instrucciones de preparación
  administrative_notes?: string;     // Notas administrativas específicas
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-appointment-form-assistant',
  templateUrl: './appointment-form-assistant.component.html',
  styleUrls: ['./appointment-form-assistant.component.css']
})
export class AppointmentFormAssistantComponent implements OnInit {
  newAppt = { 
    patient_id: '', 
    physician_id: '', 
    date: '', 
    time: '', 
    reason: '', 
    specialty: '',
    priority: 'normal',           // Prioridad por defecto
    duration: 30,                 // Duración por defecto
    preparation_notes: '',        // Instrucciones de preparación
    administrative_notes: ''      // Notas administrativas
  }; 
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
  appointmentStatuses = [
    { value: 'scheduled', label: 'Programada' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'completed', label: 'Completada' },
    { value: 'cancelled', label: 'Cancelada' },
    { value: 'no_show', label: 'No se presentó' }
  ];
  

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
          
          this.patients = list.map(p => {
            // 👇 Pega estos console.log aquí
            console.log(`--- PASO 2: DATOS RECIBIDOS (COMPONENTE) --- name: [${p.name}], paternal: [${p.paternalLastName}], maternal: [${p.maternalLastName}]`);
            const finalName = [p.name, p.paternalLastName, p.maternalLastName].filter(Boolean).join(' ');
            console.log(`--- PASO 2.1: NOMBRE CONSTRUIDO --- "'${finalName}'"`);
            
            return {
              id: p.id,
              fullName: finalName,
              rut: p.rut,
              email: p.email
            };
          });

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
    console.log('Cargando TODAS las citas para asistente');
    
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
              
              // ✅ NUEVOS CAMPOS de información completa
              reason: a.reason || '',
              specialty: a.specialty || '',
              priority: a.priority || 'normal',
              notes: a.notes || '',
              created_at: a.created_at,
              updated_at: a.updated_at,
              cancellation_reason: a.cancellation_reason || '',
              cancellation_details: a.cancellation_details || '',
              cancelled_by: a.cancelled_by || '',
              cancelled_at: a.cancelled_at,
              
              // ✅ Información del paciente (si está disponible)
              patient_phone: a.patient_phone || '',
              patient_email: a.patient_email || '',
              
              // ✅ Detalles adicionales para asistentes
              duration: a.duration || 30,
              location: a.location || 'Consulta externa',
              preparation_notes: a.preparation_notes || '',
              administrative_notes: a.administrative_notes || ''
            };
          });
          
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
      const backgroundColor = apt.status === 'cancelled' ? '#dc3545' : 
                             apt.status === 'completed' ? '#28a745' : 
                             apt.status === 'confirmed' ? '#0d6efd' : 
                             apt.status === 'no_show' ? '#dc3545' : '#6f42c1';
      
      const statusText = apt.status === 'cancelled' ? 'CANCELADA' :
                        apt.status === 'completed' ? 'COMPLETADA' : 
                        apt.status === 'confirmed' ? 'CONFIRMADA' :
                        apt.status === 'scheduled' ? 'PROGRAMADA' : 
                        apt.status === 'no_show' ? 'NO ASISTIÓ' : 'PENDIENTE';
      
      // ✅ Definir prioridades con colores
      const priorityColors = {
        'urgent': '#dc3545',
        'high': '#fd7e14', 
        'normal': '#28a745',
        'low': '#6c757d'
      };
      
      const priorityColor = priorityColors[apt.priority as keyof typeof priorityColors] || '#28a745';
      const priorityText = apt.priority === 'urgent' ? 'URGENTE' :
                          apt.priority === 'high' ? 'ALTA' :
                          apt.priority === 'low' ? 'BAJA' : 'NORMAL';
  
      // ✅ Estilo especial para citas canceladas Y no_show
      const extraStyle = (apt.status === 'cancelled' || apt.status === 'no_show') ? 
        'text-decoration: line-through; opacity: 0.9; border: 2px solid #a71e2a;' : '';
  
      // ✅ Botones según el estado de la cita (específicos para asistentes)
      let actionButtons = '';
      if (apt.status === 'scheduled') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="confirmAppointment(${apt.id})" style="background: #0d6efd; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Confirmar</button>
              <button onclick="addAdminNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Agregar Notas</button>
              <button onclick="editAppointment(${apt.id})" style="background: #fd7e14; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✏️ Editar</button>
              <button onclick="cancelAppointment(${apt.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✗ Cancelar</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'confirmed') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="completeAppointment(${apt.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Completar</button>
              <button onclick="markNoShow(${apt.id})" style="background: #ffc107; color: black; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">⚠️ No Asistió</button>
              <button onclick="addAdminNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Notas Admin</button>
              <button onclick="cancelAppointment(${apt.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✗ Cancelar</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'completed') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="viewFullRecord(${apt.id})" style="background: #17a2b8; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📋 Ver Registro</button>
              <button onclick="addAdminNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Agregar Notas</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'cancelled' || apt.status === 'no_show') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="reactivateAppointment(${apt.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🔄 Reactivar</button>
              <button onclick="viewCancellationDetails(${apt.id})" style="background: #6c757d; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">👁️ Ver Detalles</button>
            </div>
          </div>
        `;
      }
  
      return `
        <div class="modal-appointment-item" style="
          background: ${backgroundColor};
          color: white;
          padding: 1rem;
          margin: 0.75rem 0;
          border-radius: 8px;
          border-left: 4px solid ${priorityColor};
          ${extraStyle}
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <!-- Encabezado principal -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <div style="font-weight: bold; font-size: 1.1rem;">
              🕐 ${apt.time} ${(apt.status === 'cancelled' || apt.status === 'no_show') ? '❌' : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <span style="background: rgba(0,0,0,0.2); padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                ${statusText}
              </span>
              <span style="background: ${priorityColor}; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                ${priorityText}
              </span>
            </div>
          </div>
  
          <!-- Información del paciente y médico -->
          <div style="margin-bottom: 0.5rem;">
            <div style="font-weight: bold;">👤 Paciente: ${apt.patient}</div>
            <div style="font-weight: bold;">👨‍⚕️ Dr. ${apt.physician}</div>
            ${apt.specialty ? `<div style="font-size: 0.9rem; opacity: 0.9;">🏥 ${apt.specialty}</div>` : ''}
            ${apt.patient_phone ? `<div style="font-size: 0.8rem; opacity: 0.8;">📞 ${apt.patient_phone}</div>` : ''}
          </div>
  
          <!-- Detalles de la cita -->
          <div style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
            ${apt.reason ? `<div style="margin-bottom: 0.25rem;"><strong>📝 Motivo:</strong> ${apt.reason}</div>` : ''}
            ${apt.duration ? `<div style="margin-bottom: 0.25rem;"><strong>⏱️ Duración:</strong> ${apt.duration} minutos</div>` : ''}
            ${apt.location ? `<div style="margin-bottom: 0.25rem;"><strong>📍 Ubicación:</strong> ${apt.location}</div>` : ''}
            ${apt.notes ? `<div style="margin-bottom: 0.25rem;"><strong>📋 Notas Admin:</strong> ${apt.notes}</div>` : ''}
          </div>
  
          <!-- Notas administrativas -->
          ${apt.administrative_notes ? `
            <div style="background: rgba(111, 66, 193, 0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>🏢 Notas Administrativas:</strong><br>
              <em>${apt.administrative_notes}</em>
            </div>
          ` : ''}
  
          <!-- Instrucciones de preparación -->
          ${apt.preparation_notes ? `
            <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>⚠️ Instrucciones de preparación:</strong><br>
              <em>${apt.preparation_notes}</em>
            </div>
          ` : ''}
  
          <!-- Información de cancelación -->
          ${apt.status === 'cancelled' ? `
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>❌ Información de cancelación:</strong><br>
              ${apt.cancellation_reason ? `<div><strong>Motivo:</strong> ${apt.cancellation_reason}</div>` : ''}
              ${apt.cancellation_details ? `<div><strong>Detalles:</strong> ${apt.cancellation_details}</div>` : ''}
              ${apt.cancelled_by ? `<div><strong>Cancelado por:</strong> ${apt.cancelled_by}</div>` : ''}
              ${apt.cancelled_at ? `<div><strong>Fecha de cancelación:</strong> ${new Date(apt.cancelled_at).toLocaleDateString('es-ES')}</div>` : ''}
            </div>
          ` : ''}
  
          <!-- Información de no asistencia -->
          ${apt.status === 'no_show' ? `
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>⚠️ Información de no asistencia:</strong><br>
              <div>El paciente no se presentó a la cita programada</div>
              ${apt.updated_at ? `<div><strong>Fecha de registro:</strong> ${new Date(apt.updated_at).toLocaleDateString('es-ES')}</div>` : ''}
            </div>
          ` : ''}
  
          <!-- Fechas de seguimiento -->
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; opacity: 0.8;">
            ${apt.created_at ? `<div>📅 Creada: ${new Date(apt.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
            ${apt.updated_at && apt.updated_at !== apt.created_at ? `<div>🔄 Actualizada: ${new Date(apt.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
          </div>
  
          <!-- Botones de acción para asistentes -->
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
  
    // ✅ Resumen de estado incluyendo no_show
    const cancelledCount = calDay.allAppointments.filter((apt: any) => apt.status === 'cancelled').length;
    const noShowCount = calDay.allAppointments.filter((apt: any) => apt.status === 'no_show').length;
    const activeCount = calDay.allAppointments.filter((apt: any) => apt.status !== 'cancelled' && apt.status !== 'no_show').length;
    const completedCount = calDay.allAppointments.filter((apt: any) => apt.status === 'completed').length;
    const confirmedCount = calDay.allAppointments.filter((apt: any) => apt.status === 'confirmed').length;
    
    const statusSummary = `
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; color: #666;">
        <div style="font-weight: bold; margin-bottom: 0.5rem; color: #333;">
          📊 Resumen del día: ${calDay.allAppointments.length} cita(s)
        </div>
        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          ${activeCount > 0 ? `<span style="color: #28a745; font-weight: bold;">📋 ${activeCount} programada(s)</span>` : ''}
          ${confirmedCount > 0 ? `<span style="color: #0d6efd; font-weight: bold;">✓ ${confirmedCount} confirmada(s)</span>` : ''}
          ${completedCount > 0 ? `<span style="color: #28a745; font-weight: bold;">✅ ${completedCount} completada(s)</span>` : ''}
          ${cancelledCount > 0 ? `<span style="color: #dc3545; font-weight: bold;">❌ ${cancelledCount} cancelada(s)</span>` : ''}
          ${noShowCount > 0 ? `<span style="color: #dc3545; font-weight: bold;">⚠️ ${noShowCount} no asistió</span>` : ''}
        </div>
      </div>
    `;
  
    // ✅ Definir funciones globales para asistentes
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
      Swal.close();
      setTimeout(() => {
        this.cancelAppointmentWithReason(appointmentId);
      }, 100);
    };
  
    (window as any).reactivateAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };
  
    (window as any).addAdminNotes = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.addAdministrativeNotes(appointmentId);
      }, 100);
    };
  
    (window as any).editAppointment = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.editAppointment(appointmentId);
      }, 100);
    };
  
    (window as any).viewFullRecord = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.viewAppointmentDetails(appointmentId);
      }, 100);
    };
  
    (window as any).viewCancellationDetails = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.viewCancellationDetails(appointmentId);
      }, 100);
    };
  
    Swal.fire({
      title: `🏢 Gestión de Citas del ${dateFormatted}`,
      html: `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          ${statusSummary}
          ${appointmentsHtml}
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6f42c1',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  addAdministrativeNotes(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    Swal.fire({
      title: `📝 Agregar Notas Administrativas`,
      html: `
        <div style="text-align: left;">
          <p><strong>Cita:</strong></p>
          <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <div><strong>Paciente:</strong> ${appointment.patient}</div>
            <div><strong>Médico:</strong> Dr. ${appointment.physician}</div>
            <div><strong>Fecha:</strong> ${appointment.date} - ${appointment.time}</div>
            <div><strong>Estado:</strong> ${appointment.status}</div>
          </div>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Escriba las notas administrativas aquí...',
      inputValue: appointment.administrative_notes || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar Notas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6f42c1',
      inputValidator: (value) => {
        if (!value || value.trim().length < 5) {
          return 'Las notas deben tener al menos 5 caracteres';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveAdministrativeNotes(appointmentId, result.value);
      }
    });
  }
  
  // ✅ NUEVO: Guardar notas administrativas
  saveAdministrativeNotes(appointmentId: number, notes: string) {
    const updateData = {
      administrative_notes: notes,
      updated_at: new Date().toISOString()
    };
  
    this.adminSvc.updateAppointmentNotes(appointmentId, updateData)
      .subscribe({
        next: (response: any) => {
          console.log('Notas administrativas guardadas:', response);
          this.loadAllAppointments();
          Swal.fire({
            title: '✅ Notas Guardadas',
            text: 'Las notas administrativas han sido guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        error: (error: any) => {
          console.error('Error guardando notas:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar las notas. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }
  
  // ✅ NUEVO: Editar cita existente
  editAppointment(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    Swal.fire({
      title: '✏️ Editar Cita',
      html: `
        <div style="text-align: left;">
          <div id="edit-form">
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">📅 Fecha:</label>
              <input type="date" id="edit-date" value="${appointment.date}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">🕐 Hora:</label>
              <input type="time" id="edit-time" value="${appointment.time}" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">📝 Motivo:</label>
              <textarea id="edit-reason" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; min-height: 60px;">${appointment.reason || ''}</textarea>
            </div>
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-weight: bold; margin-bottom: 0.5rem;">⚡ Prioridad:</label>
              <select id="edit-priority" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                <option value="normal" ${appointment.priority === 'normal' ? 'selected' : ''}>Normal</option>
                <option value="high" ${appointment.priority === 'high' ? 'selected' : ''}>Alta</option>
                <option value="urgent" ${appointment.priority === 'urgent' ? 'selected' : ''}>Urgente</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💾 Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6f42c1',
      preConfirm: () => {
        const date = (document.getElementById('edit-date') as HTMLInputElement).value;
        const time = (document.getElementById('edit-time') as HTMLInputElement).value;
        const reason = (document.getElementById('edit-reason') as HTMLTextAreaElement).value;
        const priority = (document.getElementById('edit-priority') as HTMLSelectElement).value;
  
        if (!date || !time) {
          Swal.showValidationMessage('Fecha y hora son obligatorios');
          return null;
        }
  
        return { date, time, reason, priority };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateAppointmentDetails(appointmentId, result.value);
      }
    });
  }
  
  // ✅ NUEVO: Actualizar detalles de la cita
  updateAppointmentDetails(appointmentId: number, updateData: any) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    const fullUpdateData = {
      patient_id: appointment.patientId,
      physician_id: appointment.physicianId,
      date: updateData.date,
      time: updateData.time,
      reason: updateData.reason,
      priority: updateData.priority,
      status: appointment.status, // Mantener el status actual
      notes: appointment.notes,
      specialty: appointment.specialty
    };
  
    this.adminSvc.updateAppointment(appointmentId, fullUpdateData)
      .subscribe({
        next: (response: any) => {
          console.log('Cita actualizada:', response);
          this.loadAllAppointments();
          Swal.fire({
            title: '✅ Cita Actualizada',
            text: 'Los cambios han sido guardados correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        error: (error: any) => {
          console.error('Error actualizando cita:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar la cita. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }
  
  // ✅ NUEVO: Ver detalles completos de la cita
  viewAppointmentDetails(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    const statusText = appointment.status === 'scheduled' ? 'Programada' :
                      appointment.status === 'confirmed' ? 'Confirmada' :
                      appointment.status === 'completed' ? 'Completada' :
                      appointment.status === 'cancelled' ? 'Cancelada' :
                      appointment.status === 'no_show' ? 'No Asistió' : 'Pendiente';
  
    Swal.fire({
      title: `📋 Registro Completo - Cita #${appointment.id}`,
      html: `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          <!-- Información general -->
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">📅 Información General</h4>
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Estado:</strong> <span style="color: ${appointment.status === 'completed' ? '#28a745' : appointment.status === 'cancelled' ? '#dc3545' : '#007bff'};">${statusText}</span></p>
            <p><strong>Prioridad:</strong> <span style="color: ${appointment.priority === 'urgent' ? '#dc3545' : appointment.priority === 'high' ? '#fd7e14' : '#28a745'};">${appointment.priority === 'urgent' ? 'URGENTE' : appointment.priority === 'high' ? 'ALTA' : appointment.priority === 'low' ? 'BAJA' : 'NORMAL'}</span></p>
            <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
            <p><strong>Ubicación:</strong> ${appointment.location || 'Consulta externa'}</p>
          </div>
          
          <!-- Información del paciente -->
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">👤 Paciente</h4>
            <p><strong>Nombre:</strong> ${appointment.patient}</p>
            ${appointment.patient_phone ? `<p><strong>Teléfono:</strong> ${appointment.patient_phone}</p>` : ''}
            ${appointment.patient_email ? `<p><strong>Email:</strong> ${appointment.patient_email}</p>` : ''}
          </div>
          
          <!-- Información del médico -->
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">👨‍⚕️ Médico</h4>
            <p><strong>Nombre:</strong> Dr. ${appointment.physician}</p>
            ${appointment.specialty ? `<p><strong>Especialidad:</strong> ${appointment.specialty}</p>` : ''}
          </div>
          
          <!-- Motivo y detalles -->
          ${appointment.reason ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #2d3748;">📝 Motivo de Consulta</h4>
              <p>${appointment.reason}</p>
            </div>
          ` : ''}
          
          <!-- Notas administrativas -->
          ${appointment.notes ? `
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #2d3748;">📋 Notas Administrativas</h4>
              <p>${appointment.notes}</p>
            </div>
          ` : ''}
  
          <!-- Instrucciones de preparación -->
          ${appointment.preparation_notes ? `
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #2d3748;">⚠️ Instrucciones de Preparación</h4>
              <p>${appointment.preparation_notes}</p>
            </div>
          ` : ''}
          
          <!-- Información de cancelación -->
          ${appointment.status === 'cancelled' ? `
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Información de Cancelación</h4>
              ${appointment.cancellation_reason ? `<p><strong>Motivo:</strong> ${appointment.cancellation_reason}</p>` : ''}
              ${appointment.cancellation_details ? `<p><strong>Detalles:</strong> ${appointment.cancellation_details}</p>` : ''}
              ${appointment.cancelled_by ? `<p><strong>Cancelado por:</strong> ${appointment.cancelled_by}</p>` : ''}
              ${appointment.cancelled_at ? `<p><strong>Fecha de cancelación:</strong> ${new Date(appointment.cancelled_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
            </div>
          ` : ''}
  
          <!-- Timestamps -->
          <div style="background: #f1f3f4; padding: 15px; border-radius: 8px; border-top: 3px solid #6f42c1;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">🕐 Historial</h4>
            ${appointment.created_at ? `<p><strong>📅 Creada:</strong> ${new Date(appointment.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
            ${appointment.updated_at && appointment.updated_at !== appointment.created_at ? `<p><strong>🔄 Última actualización:</strong> ${new Date(appointment.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
          </div>
        </div>
      `,
      width: '700px',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6f42c1'
    });
  }
  
  // ✅ NUEVO: Ver detalles de cancelación
  viewCancellationDetails(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    Swal.fire({
      title: `❌ Detalles de Cancelación - Cita #${appointment.id}`,
      html: `
        <div style="text-align: left;">
          <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #721c24;">Información de la Cita Cancelada</h4>
            <p><strong>Paciente:</strong> ${appointment.patient}</p>
            <p><strong>Médico:</strong> Dr. ${appointment.physician}</p>
            <p><strong>Fecha original:</strong> ${appointment.date} - ${appointment.time}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 0.5rem 0; color: #856404;">Detalles de Cancelación</h4>
            ${appointment.cancellation_reason ? `<p><strong>Motivo:</strong> ${appointment.cancellation_reason}</p>` : '<p><strong>Motivo:</strong> No especificado</p>'}
            ${appointment.cancellation_details ? `<p><strong>Detalles:</strong> ${appointment.cancellation_details}</p>` : ''}
            ${appointment.cancelled_by ? `<p><strong>Cancelado por:</strong> ${appointment.cancelled_by}</p>` : ''}
            ${appointment.cancelled_at ? `<p><strong>Fecha de cancelación:</strong> ${new Date(appointment.cancelled_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>` : ''}
          </div>
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#6f42c1',
      showCancelButton: true,
      cancelButtonText: '🔄 Reactivar Cita',
      cancelButtonColor: '#28a745'
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.updateAppointmentStatus(appointmentId, 'scheduled');
      }
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
        cancelled_by: this.assistantId,
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
    const appointmentData = {
      patient_id: this.newAppt.patient_id,
      physician_id: this.newAppt.physician_id,
      date: this.newAppt.date,
      time: this.newAppt.time,
      reason: this.newAppt.reason,
      specialty: this.newAppt.specialty,
      // ✅ NUEVOS CAMPOS
      priority: this.newAppt.priority,
      duration: this.newAppt.duration,
      preparation_notes: this.newAppt.preparation_notes,
      administrative_notes: this.newAppt.administrative_notes,
      status: 'scheduled',
      location: 'Consulta externa'
    };
  
    console.log('Enviando cita completa desde asistente:', appointmentData);
    
    // ✅ Guardar los filtros actuales antes de limpiar el formulario
    const currentPatientId = this.newAppt.patient_id;
    const currentPhysicianId = this.newAppt.physician_id;
    const currentSpecialty = this.newAppt.specialty;
    
    this.adminSvc.createAppointment(appointmentData)
    .subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        
        // ✅ Limpiar formulario incluyendo nuevos campos
        this.newAppt = { 
          patient_id: currentPatientId, 
          physician_id: currentPhysicianId, 
          specialty: currentSpecialty,
          date: '', 
          time: '', 
          reason: '',
          priority: 'normal',
          duration: 30,
          preparation_notes: '',
          administrative_notes: ''
        };
        
        this.loadAllAppointments();
        
        // ✅ Mensaje de confirmación mejorado
        Swal.fire({
          title: '✅ ¡Cita creada con éxito!',
          html: `
            <div style="text-align: left;">
              <p><strong>Cita programada por asistente:</strong></p>
              <div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #28a745;">
                <div style="margin-bottom: 0.5rem;">📅 <strong>Fecha:</strong> ${appointmentData.date}</div>
                <div style="margin-bottom: 0.5rem;">🕐 <strong>Hora:</strong> ${appointmentData.time}</div>
                <div style="margin-bottom: 0.5rem;">👤 <strong>Paciente:</strong> ${this.patients.find(p => p.id.toString() === this.newAppt.patient_id)?.fullName}</div>
                <div style="margin-bottom: 0.5rem;">👨‍⚕️ <strong>Médico:</strong> Dr. ${this.allPhysicians.find(p => p.id.toString() === this.newAppt.physician_id)?.fullName}</div>
                <div style="margin-bottom: 0.5rem;">🏥 <strong>Especialidad:</strong> ${appointmentData.specialty}</div>
                <div style="margin-bottom: 0.5rem;">⏱️ <strong>Duración:</strong> ${appointmentData.duration} minutos</div>
                ${appointmentData.reason ? `<div style="margin-bottom: 0.5rem;">📝 <strong>Motivo:</strong> ${appointmentData.reason}</div>` : ''}
                <div style="margin-bottom: 0.5rem;">⚡ <strong>Prioridad:</strong> ${appointmentData.priority === 'urgent' ? 'Urgente' : appointmentData.priority === 'high' ? 'Alta' : 'Normal'}</div>
              </div>
              <div style="background: #cff4fc; padding: 0.75rem; border-radius: 8px; border-left: 4px solid #0dcaf0;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">📋 Acciones automáticas:</div>
                <ul style="margin: 0; padding-left: 1.5rem;">
                  <li>✉️ Notificación enviada al paciente y médico</li>
                  <li>📅 Cita agregada al calendario del médico</li>
                  <li>📋 Registro administrativo actualizado</li>
                  ${appointmentData.priority === 'urgent' ? '<li style="color: #dc3545;"><strong>⚠️ CITA URGENTE - Notificación prioritaria enviada</strong></li>' : ''}
                </ul>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#6f42c1',
          width: '600px',
          timer: 8000,
          timerProgressBar: true
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