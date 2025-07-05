// admin-appointment-manager.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../services/admin.service';
import { AuthService } from '../../../../../services/auth.service';
import { PhysicianService } from '../../../../../services/physician.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

// Definir constantes de especialidades médicas
const MEDICAL_SPECIALTIES = [
  'Cardiología', 'Neurología', 'Pediatría', 'Ginecología',
  'Dermatología', 'Psiquiatría', 'Oftalmología', 'Traumatología',
  'Medicina Interna', 'Cirugía General', 'Endocrinología', 'Gastroenterología'
];

interface PatientDto {
  id: number;
  firstName: string; // Mapea a 'name' del backend
  lastName: string;  // Mapea a 'paternalLastName' del backend
  fullName: string;
  rut: string;
  email: string;
  phone: string;
}

interface PhysicianDto {
  id: number;
  firstName: string; // Mapea a 'name' del backend
  lastName: string;  // Mapea a 'paternalLastName' del backend
  fullName: string;
  email: string;
  specialty: string;
  licenseNumber: string;
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
  priority?: string;
  notes?: string;
  reason?: string;
  specialty?: string;
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
    priority: 'normal',
    notes: ''
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

  // ✅ NUEVAS VARIABLES PARA EDICIÓN
  isEditing = false;
  editingAppointmentId: number | null = null;
  
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
    this.initializeAdmin();
    this.loadAllPatients();
    this.loadAllPhysicians();
    this.loadAllAppointments();
    this.generateCalendar();
  }

  initializeAdmin() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.adminId = user.id || user.email || 'admin';
    }
  }

  // ✅ MÉTODO ACTUALIZADO: Submit con lógica de edición y creación
  submit() {
    // Validaciones básicas
    if (!this.newAppt.patient_id || !this.newAppt.physician_id || !this.newAppt.date || !this.newAppt.time) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos obligatorios',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (this.isEditing && this.editingAppointmentId) {
      // ✅ MODO EDICIÓN
      this.updateAppointment();
    } else {
      // ✅ MODO CREACIÓN
      this.createAppointment();
    }
  }

  // ✅ NUEVO MÉTODO: Crear nueva cita
  createAppointment() {
    console.log('Creando nueva cita:', this.newAppt);
    
    const appointmentData = {
      patient_id: parseInt(this.newAppt.patient_id),
      physician_id: parseInt(this.newAppt.physician_id),
      date: this.newAppt.date,
      time: this.newAppt.time,
      reason: this.newAppt.reason,
      priority: this.newAppt.priority,
      notes: this.newAppt.notes,
      status: 'scheduled'
    };

    this.adminSvc.createAppointment(appointmentData)
      .subscribe({
        next: (response) => {
          console.log('Cita creada exitosamente:', response);
          this.clearForm();
          this.loadAllAppointments();
          
          Swal.fire({
            title: '✅ Cita Creada',
            text: 'La nueva cita ha sido programada exitosamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        error: (error) => {
          console.error('Error creando cita:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear la cita. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  // ✅ NUEVO MÉTODO: Actualizar cita existente
  updateAppointment() {
    console.log('Actualizando cita ID:', this.editingAppointmentId, 'con datos:', this.newAppt);
    
    const appointmentData = {
      patient_id: parseInt(this.newAppt.patient_id),
      physician_id: parseInt(this.newAppt.physician_id),
      date: this.newAppt.date,
      time: this.newAppt.time,
      reason: this.newAppt.reason,
      priority: this.newAppt.priority,
      notes: this.newAppt.notes
    };
    
    this.adminSvc.updateAppointment(this.editingAppointmentId!, appointmentData)
      .subscribe({
        next: (response) => {
          console.log('Cita actualizada:', response);
          this.resetEditMode();
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
        error: (error) => {
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

  editAppointment(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    
    if (appointment) {
      console.log('✅ Cita encontrada para editar:', appointment);
      console.log('✅ Pacientes disponibles:', this.patients);
      console.log('✅ Médicos disponibles:', this.allPhysicians);
      
      // ✅ Marcar como modo edición
      this.isEditing = true;
      this.editingAppointmentId = appointmentId;
      
      // ✅ Verificar que los IDs coincidan
      const selectedPatient = this.patients.find(p => p.id === appointment.patientId);
      const selectedPhysician = this.allPhysicians.find(p => p.id === appointment.physicianId);
      
      console.log('✅ Paciente seleccionado:', selectedPatient);
      console.log('✅ Médico seleccionado:', selectedPhysician);
      
      // ✅ Precargar TODOS los datos
      this.newAppt.patient_id = appointment.patientId.toString();
      this.newAppt.physician_id = appointment.physicianId.toString();
      this.newAppt.date = appointment.date;
      this.newAppt.time = appointment.time;
      this.newAppt.reason = appointment.reason || '';
      this.newAppt.specialty = appointment.specialty || '';
      this.newAppt.priority = appointment.priority || 'normal';
      this.newAppt.notes = appointment.notes || '';
      
      console.log('✅ Datos cargados en formulario:', this.newAppt);
      
      // ✅ Actualizar filtros si es necesario
      this.onSpecialtyChange();
      this.onPatientSelectionChange();
      
      Swal.fire({
        title: '✏️ Modo Edición Activado',
        html: `
          <div style="text-align: left;">
            <p>📝 Se ha cargado la cita <strong>#${appointmentId}</strong> para edición.</p>
            <p>🔽 Vaya al formulario de la izquierda para realizar los cambios.</p>
            <p>💾 El botón "Crear Cita" cambió a "Actualizar Cita".</p>
            <br>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 4px solid #007bff;">
              <strong>Datos actuales:</strong><br>
              📅 ${appointment.date} a las ${appointment.time}<br>
              👤 ${selectedPatient ? selectedPatient.fullName : 'Paciente no encontrado'}<br>
              👨‍⚕️ Dr. ${selectedPhysician ? selectedPhysician.fullName : 'Médico no encontrado'}
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        timer: 7000,
        timerProgressBar: true
      });
    } else {
      console.error('❌ No se encontró la cita con ID:', appointmentId);
    }
  }

  // ✅ NUEVO MÉTODO: Cancelar edición
  cancelEdit() {
    Swal.fire({
      title: '¿Cancelar edición?',
      text: 'Se perderán los cambios no guardados',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Continuar editando',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetEditMode();
        Swal.fire({
          title: 'Edición cancelada',
          text: 'El formulario ha sido limpiado',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // ✅ NUEVO MÉTODO: Resetear modo edición
  resetEditMode() {
    this.isEditing = false;
    this.editingAppointmentId = null;
    this.clearForm();
  }

  // ✅ MÉTODO MEJORADO: Limpiar formulario
  clearForm() {
    this.newAppt = { 
      patient_id: '', 
      physician_id: '', 
      date: '', 
      time: '', 
      reason: '', 
      specialty: '',
      priority: 'normal',
      notes: ''
    };
    this.searchPatient = '';
    this.filteredPatients = [...this.patients];
  }

  // ... [Resto de métodos existentes permanecen igual] ...

  loadAllPatients() {
    this.adminSvc.getAllPatients()
      .subscribe({
        next: (list: any[]) => {
          console.log('Datos originales de pacientes:', list); //Para debugging
          
          this.patients = list.map(p => ({
            id: p.id,
            //Usar los nombres correctos del backend
            firstName: p.name, // backend usa 'name'
            lastName: p.paternalLastName, // backend usa 'paternalLastName'
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName || ''}`.trim(),
            rut: p.rut,
            email: p.email,
            phone: p.phone
          }));
          this.filteredPatients = [...this.patients];
          console.log('Pacientes mapeados:', this.patients); //Para debugging
        },
        error: (error) => {
          console.error('Error al cargar pacientes:', error);
        }
      });
  }

  loadAllPhysicians() {
    this.physicianService.getAllPhysicians()
      .subscribe({
        next: (list: any[]) => {
          console.log('Datos originales de médicos:', list); // Para debugging
          
          this.allPhysicians = list.map(p => ({
            id: p.id,
            // Usar los nombres correctos del backend
            firstName: p.name, // backend usa 'name'
            lastName: p.paternalLastName, // backend usa 'paternalLastName'
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName || ''}`.trim(),
            email: p.email,
            specialty: p.specialty,
            licenseNumber: p.licenseNumber
          }));
          this.physicians = [...this.allPhysicians];
          this.calculateSpecialtyCounts();
          console.log('Médicos mapeados:', this.allPhysicians); // Para debugging
        },
        error: (error) => {
          console.error('Error al cargar médicos:', error);
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
              // ✅ VERIFICAR: Nombres de médicos y pacientes
              physician: a.physician_name || a.physician || 'Sin nombre',
              patient: a.patient_name || a.patient || 'Sin nombre',
              patientId: a.patient_id,
              physicianId: a.physician_id,
              status: a.status,
              isManageable: true,
              cancellation_reason: a.cancellation_reason,
              cancellation_details: a.cancellation_details,
              priority: a.priority || 'normal',
              notes: a.notes || '',
              reason: a.reason || '',
              specialty: a.specialty || ''
            };
          });
          
          this.allAppointments = mappedAppointments;
          this.applyFilters();
          
          console.log('Array final de todas las citas:', this.allAppointments);
          this.generateCalendar();
          
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

  onPatientSearch() {
    if (this.searchPatient.trim() === '') {
      this.filteredPatients = [...this.patients];
    } else {
      const searchTerm = this.searchPatient.toLowerCase().trim();
      this.filteredPatients = this.patients.filter(patient =>
        patient.fullName.toLowerCase().includes(searchTerm) ||
        patient.rut.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm)
      );
    }
  }

  onPatientSelectionChange() {
    const selectedPatient = this.patients.find(p => p.id.toString() === this.newAppt.patient_id);
    if (selectedPatient) {
      console.log('Paciente seleccionado:', selectedPatient);
    }
  }

  onSpecialtyChange() {
    this.filteredPhysicians = this.getFilteredPhysicians();
    if (this.newAppt.specialty && this.filteredPhysicians.length === 0) {
      console.log('No hay médicos disponibles para la especialidad:', this.newAppt.specialty);
    }
  }

  onPhysicianSelectionChange() {
    const selectedPhysician = this.physicians.find(p => p.id.toString() === this.newAppt.physician_id);
    if (selectedPhysician) {
      console.log('Médico seleccionado:', selectedPhysician);
      this.newAppt.specialty = selectedPhysician.specialty;
    }
  }

  getFilteredPhysicians() {
    if (!this.newAppt.specialty) {
      return this.allPhysicians;
    }
    return this.allPhysicians.filter(physician => 
      physician.specialty === this.newAppt.specialty
    );
  }

  calculateSpecialtyCounts() {
    const counts = this.medicalSpecialties.map(specialty => ({
      specialty,
      count: this.allPhysicians.filter(p => p.specialty === specialty).length
    }));
    this.specialtyCounts = counts;
  }

  getPhysicianCount(specialty: string): number {
    return this.allPhysicians.filter(p => p.specialty === specialty).length;
  }

  getAdminInfo(): string {
    return this.currentUser?.name || 'Administrador';
  }

  goToAdminDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    this.calendarDays = [];
    
    // Días del mes anterior
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      this.calendarDays.push({
        day: day,
        date: new Date(year, month - 1, day),
        isOtherMonth: true,
        isToday: false,
        appointments: [],
        totalAppointments: 0,
        isDayWithAppointments: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = this.formatDate(date);
      const dayAppointments = this.appointments.filter(apt => apt.date === dateString);
      
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      this.calendarDays.push({
        day: day,
        date: date,
        dateString: dateString,
        isOtherMonth: false,
        isToday: isToday,
        appointments: dayAppointments.slice(0, 3),
        allAppointments: dayAppointments,
        totalAppointments: dayAppointments.length,
        isDayWithAppointments: dayAppointments.length > 0,
        hasMoreAppointments: dayAppointments.length > 3,
        hasScheduled: dayAppointments.some(apt => apt.status === 'scheduled'),
        hasConfirmed: dayAppointments.some(apt => apt.status === 'confirmed'),
        hasCompleted: dayAppointments.some(apt => apt.status === 'completed'),
        hasCancelled: dayAppointments.some(apt => apt.status === 'cancelled'),
        hasNoShow: dayAppointments.some(apt => apt.status === 'no_show')
      });
    }
    
    // Días del siguiente mes
    const totalCells = Math.ceil(this.calendarDays.length / 7) * 7;
    const remainingCells = totalCells - this.calendarDays.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      this.calendarDays.push({
        day: day,
        date: new Date(year, month + 1, day),
        isOtherMonth: true,
        isToday: false,
        appointments: [],
        totalAppointments: 0,
        isDayWithAppointments: false
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getAppointmentStats() {
    const total = this.appointments.length;
    const scheduled = this.appointments.filter(apt => apt.status === 'scheduled').length;
    const confirmed = this.appointments.filter(apt => apt.status === 'confirmed').length;
    const completed = this.appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = this.appointments.filter(apt => apt.status === 'cancelled').length;
    const noShow = this.appointments.filter(apt => apt.status === 'no_show').length;
    
    return { total, scheduled, confirmed, completed, cancelled, noShow };
  }

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

  exportAppointments() {
    console.log('Exportando citas...');
    // Implementar exportación
  }

  getMonthName(): string {
    return this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  clearFilters() {
    if (this.isEditing) {
      // Si estamos editando, preguntar si cancelar
      this.cancelEdit();
    } else {
      // Si no estamos editando, limpiar formulario normal
      this.selectedPhysician = '';
      this.selectedStatus = '';
      this.selectedSpecialty = '';
      this.dateFrom = '';
      this.dateTo = '';
      this.searchPatient = '';
      this.showFiltered = false;
      this.clearForm();
      this.applyFilters();
    }
  }

  applyFilters() {
    let filtered = [...this.allAppointments];
    let hasActiveFilters = false;

    if (this.selectedPhysician) {
      filtered = filtered.filter(apt => apt.physicianId.toString() === this.selectedPhysician);
      hasActiveFilters = true;
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(apt => apt.status === this.selectedStatus);
      hasActiveFilters = true;
    }

    if (this.selectedSpecialty) {
      const specialtyPhysicians = this.allPhysicians
        .filter(p => p.specialty === this.selectedSpecialty)
        .map(p => p.id);
      filtered = filtered.filter(apt => specialtyPhysicians.includes(apt.physicianId));
      hasActiveFilters = true;
    }

    if (this.dateFrom) {
      filtered = filtered.filter(apt => apt.date >= this.dateFrom);
      hasActiveFilters = true;
    }

    if (this.dateTo) {
      filtered = filtered.filter(apt => apt.date <= this.dateTo);
      hasActiveFilters = true;
    }

    this.appointments = filtered;
    this.showFiltered = hasActiveFilters;
    this.generateCalendar();
  }

  onStatusFilterChange() {
    this.applyFilters();
  }

  onSpecialtyFilterChange() {
    this.applyFilters();
  }

  onDateFilterChange() {
    this.applyFilters();
  }

  getFilterInfo(): string {
    const filters = [];
    
    if (this.selectedPhysician) {
      const physician = this.allPhysicians.find(p => p.id.toString() === this.selectedPhysician);
      if (physician) filters.push(`Médico: Dr. ${physician.fullName}`);
    }
    
    if (this.selectedStatus) {
      const status = this.appointmentStatuses.find(s => s.value === this.selectedStatus);
      if (status) filters.push(`Estado: ${status.label}`);
    }
    
    if (this.selectedSpecialty) {
      filters.push(`Especialidad: ${this.selectedSpecialty}`);
    }
    
    if (this.dateFrom || this.dateTo) {
      const from = this.dateFrom || 'inicio';
      const to = this.dateTo || 'fin';
      filters.push(`Fechas: ${from} - ${to}`);
    }
    
    return filters.join(', ');
  }

  showDayDetails(calDay: any) {
    if (!calDay.allAppointments || calDay.allAppointments.length === 0) {
      return;
    }

    const appointments = calDay.allAppointments;
    const dateString = calDay.dateString || calDay.allAppointments[0].date;

    // Crear HTML para las citas
    let appointmentsHtml = appointments.map((apt: any) => {
      const statusClass = apt.status;
      const statusText = apt.status === 'scheduled' ? 'Programada' :
                        apt.status === 'confirmed' ? 'Confirmada' :
                        apt.status === 'completed' ? 'Completada' :
                        apt.status === 'cancelled' ? 'Cancelada' :
                        'No vino';

      const priorityColor = apt.priority === 'urgent' ? '#dc3545' :
                           apt.priority === 'high' ? '#fd7e14' :
                           apt.priority === 'normal' ? '#28a745' : '#6c757d';

      return `
        <div class="appointment-detail ${statusClass}" style="margin-bottom: 15px; padding: 12px; border-left: 4px solid ${priorityColor}; background: #f8f9fa; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div>
              <strong style="color: #2d3748;">🕐 ${apt.time}</strong>
              <span class="status-badge ${statusClass}" style="margin-left: 10px; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                ${statusText}
              </span>
            </div>
            <div style="font-size: 0.8rem; color: #666;">
              Prioridad: <strong style="color: ${priorityColor};">${apt.priority || 'normal'}</strong>
            </div>
          </div>
          
          <div style="margin-bottom: 8px;">
            <div><strong>👤 Paciente:</strong> ${apt.patient}</div>
            <div><strong>👨‍⚕️ Médico:</strong> Dr. ${apt.physician}</div>
          </div>
          
          ${apt.reason ? `<div style="margin-bottom: 8px;"><strong>📝 Motivo:</strong> ${apt.reason}</div>` : ''}
          ${apt.notes ? `<div style="margin-bottom: 8px;"><strong>📋 Notas:</strong> ${apt.notes}</div>` : ''}
          ${apt.cancellation_reason ? `<div style="margin-bottom: 8px; color: #dc3545;"><strong>❌ Motivo cancelación:</strong> ${apt.cancellation_reason}</div>` : ''}
          
          <div class="appointment-actions" style="margin-top: 10px; text-align: center;">
            ${apt.status === 'scheduled' ? `
              <button onclick="confirmAppointment(${apt.id})" style="background: #38a169; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Confirmar</button>
            ` : ''}
            
            ${apt.status === 'scheduled' || apt.status === 'confirmed' ? `
              <button onclick="completeAppointment(${apt.id})" style="background: #319795; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Completar</button>
              <button onclick="editAppointment(${apt.id})" style="background: #667eea; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✏️ Editar</button>
              <button onclick="cancelAppointment(${apt.id})" style="background: #e53e3e; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✗ Cancelar</button>
            ` : ''}
            
            ${apt.status === 'confirmed' ? `
              <button onclick="markNoShow(${apt.id})" style="background: #d69e2e; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">⚠️ No vino</button>
            ` : ''}
            
            ${apt.status === 'cancelled' || apt.status === 'completed' || apt.status === 'no_show' ? `
              <button onclick="reactivateAppointment(${apt.id})" style="background: #3182ce; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🔄 Reactivar</button>
            ` : ''}
            
            ${apt.status === 'cancelled' ? `
              <button onclick="deleteAppointment(${apt.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🗑️ Eliminar</button>
            ` : ''}
            
            <button onclick="viewDetails(${apt.id})" style="background: #6c757d; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">👁️ Ver Detalles</button>
          </div>
        </div>
      `;
    }).join('');

    // Definir funciones globales
    (window as any).deleteAppointment = (appointmentId: number) => {
      console.log('Función global deleteAppointment llamada para ID:', appointmentId);
      this.deleteAppointment(appointmentId);
    };

    (window as any).cancelAppointment = (appointmentId: number) => {
      console.log('Función global cancelAppointment llamada para ID:', appointmentId);
      this.cancelAppointmentWithReason(appointmentId);
    };

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

    (window as any).reactivateAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };

    // ✅ FUNCIÓN GLOBAL PARA EDITAR
    (window as any).editAppointment = (appointmentId: number) => {
      this.editAppointment(appointmentId);
      Swal.close();
    };

    (window as any).viewDetails = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.viewAppointmentDetails(appointmentId);
      }, 100);
    };

    Swal.fire({
      title: `📅 Citas del ${dateString}`,
      html: `
        <div style="max-height: 400px; overflow-y: auto; text-align: left;">
          ${appointmentsHtml}
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      width: '800px',
      heightAuto: false,
      customClass: {
        popup: 'appointment-details-popup'
      }
    });
  }

  deleteAppointment(appointmentId: number) {
    console.log('Iniciando eliminación de cita ID:', appointmentId);
    
    Swal.close();
    
    setTimeout(() => {
      Swal.fire({
        title: '¿Eliminar cita permanentemente?',
        text: 'Esta acción no se puede deshacer. La cita será eliminada del sistema.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        heightAuto: false
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Usuario confirmó eliminación, enviando petición...');
          
          this.adminSvc.deleteAppointment(appointmentId)
            .subscribe({
              next: (response) => {
                console.log('Respuesta del servidor al eliminar:', response);
                this.loadAllAppointments();
                
                Swal.fire({
                  title: 'Cita eliminada',
                  text: 'La cita ha sido eliminada permanentemente del sistema',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  timer: 3000,
                  timerProgressBar: true
                });
              },
              error: (error) => {
                console.error('Error eliminando cita:', error);
                Swal.fire({
                  title: 'Error',
                  text: `No se pudo eliminar la cita: ${error.error?.message || error.message}`,
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
              }
            });
        } else if (result.isDismissed) {
          console.log('Usuario canceló la eliminación');
        }
      }).catch((error) => {
        console.error('Error en SweetAlert:', error);
        alert('Error al mostrar el diálogo. Intente nuevamente.');
      });
    }, 100);
  }

  cancelAppointmentWithReason(appointmentId: number) {
    console.log('Iniciando proceso de cancelación para cita:', appointmentId);
    
    Swal.close();
    
    setTimeout(() => {
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
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputValidator: (value) => {
          if (!value) {
            return 'Debe seleccionar un motivo';
          }
          return null;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          if (result.value === 'other') {
            Swal.close();
            
            setTimeout(() => {
              Swal.fire({
                title: 'Especifique el motivo',
                input: 'textarea',
                inputPlaceholder: 'Describa el motivo de cancelación...',
                showCancelButton: true,
                confirmButtonText: 'Cancelar Cita',
                cancelButtonText: 'Volver',
                confirmButtonColor: '#dc3545',
                allowOutsideClick: false,
                allowEscapeKey: false,
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
            }, 100);
          } else {
            this.cancelAppointmentWithDetails(appointmentId, result.value, '');
          }
        }
      }).catch((error) => {
        console.error('Error en modal de cancelación:', error);
        alert('Error al mostrar el diálogo de cancelación. Intente nuevamente.');
      });
    }, 100);
  }

  cancelAppointmentWithDetails(appointmentId: number, reason: string, details: string) {
    console.log('Iniciando cancelación con detalles:', { appointmentId, reason, details });
    
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
          console.log('Respuesta del servidor al cancelar:', response);
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
            text: `No se pudo cancelar la cita: ${error.error?.message || error.message}`,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }

  updateAppointmentStatus(appointmentId: number, newStatus: string) {
    console.log('Actualizando estado de cita:', appointmentId, 'a:', newStatus);
    
    this.adminSvc.updateAppointmentStatus(appointmentId, newStatus)
      .subscribe({
        next: (response) => {
          console.log('Estado actualizado exitosamente:', response);
          this.loadAllAppointments();
          
          const statusText = newStatus === 'confirmed' ? 'confirmada' :
                            newStatus === 'completed' ? 'completada' :
                            newStatus === 'no_show' ? 'marcada como no asistió' :
                            'reactivada';
          
          Swal.fire({
            title: '¡Estado actualizado!',
            text: `La cita ha sido ${statusText}`,
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

  viewAppointmentDetails(appointmentId: number) {
    const appointment = this.allAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const statusText = appointment.status === 'scheduled' ? 'Programada' :
                      appointment.status === 'confirmed' ? 'Confirmada' :
                      appointment.status === 'completed' ? 'Completada' :
                      appointment.status === 'cancelled' ? 'Cancelada' :
                      'No se presentó';

    Swal.fire({
      title: `📋 Detalles de la Cita #${appointment.id}`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">📅 Información General</h4>
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Estado:</strong> <span style="color: ${appointment.status === 'completed' ? '#28a745' : appointment.status === 'cancelled' ? '#dc3545' : '#007bff'};">${statusText}</span></p>
            <p><strong>Prioridad:</strong> ${appointment.priority || 'Normal'}</p>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">👤 Paciente</h4>
            <p><strong>Nombre:</strong> ${appointment.patient}</p>
          </div>
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #2d3748;">👨‍⚕️ Médico</h4>
            <p><strong>Nombre:</strong> Dr. ${appointment.physician}</p>
          </div>
          
          ${appointment.reason ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #2d3748;">📝 Motivo de Consulta</h4>
              <p>${appointment.reason}</p>
            </div>
          ` : ''}
          
          ${appointment.notes ? `
            <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #2d3748;">📋 Notas Administrativas</h4>
              <p>${appointment.notes}</p>
            </div>
          ` : ''}
          
          ${appointment.cancellation_reason ? `
            <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #721c24;">❌ Información de Cancelación</h4>
              <p><strong>Motivo:</strong> ${appointment.cancellation_reason}</p>
              ${appointment.cancellation_details ? `<p><strong>Detalles:</strong> ${appointment.cancellation_details}</p>` : ''}
            </div>
          ` : ''}
        </div>
      `,
      width: '600px',
      showConfirmButton: true,
      confirmButtonText: 'Cerrar'
    });
  }
}