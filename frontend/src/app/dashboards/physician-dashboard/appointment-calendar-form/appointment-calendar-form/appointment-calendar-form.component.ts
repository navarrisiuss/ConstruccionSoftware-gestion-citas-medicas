import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface PatientDto {
  id: number;
  fullName: string;
  rut: string;
  email?: string;
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
  isCurrentPhysician: boolean;
  reason?: string;                    // Motivo de la consulta
  specialty?: string;                 // Especialidad médica
  priority?: string;                  // Prioridad (normal, urgent, etc.)
  notes?: string;                     // Notas del médico
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
  medical_notes?: string;            // Notas médicas del doctor
}
@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-appointment-calendar-form',
  templateUrl: './appointment-calendar-form.component.html',
  styleUrls: ['./appointment-calendar-form.component.css']
})
export class AppointmentCalendarFormComponent implements OnInit {
  newAppt = { 
    patient_id: '', 
    physician_id: '', 
    date: '', 
    time: '', 
    reason: '',
    priority: 'normal',        
    duration: 30,              
    preparation_notes: ''      
  };
  patients: PatientDto[] = [];
  filteredPatients: PatientDto[] = [];
  appointments: AppointmentEvent[] = [];
  physicianId = '';
  currentUser: any = null;
  searchPatient = '';

  // Calendario
  currentDate = new Date();
  calendarDays: any[] = [];

  constructor(
    private adminSvc: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser && this.currentUser.id) {
      this.physicianId = this.currentUser.id.toString();
      this.newAppt.physician_id = this.physicianId;

      console.log('Médico autenticado:', this.currentUser);
      console.log('ID del médico:', this.physicianId);

      this.loadPatients();
      this.loadAppointments();
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

  loadAppointments() {
    console.log('Cargando citas del médico:', this.physicianId);
    
    // Cargar SOLO las citas del médico actual
    this.adminSvc.getAllAppointments()
      .subscribe({
        next: (list: any[]) => {
          console.log('Todas las citas desde el servidor:', list);
          
          // ✅ Filtrar solo las citas del médico actual
          const physicianAppointments = list.filter(a => 
            a.physician_id.toString() === this.physicianId
          );
          
          console.log('Citas filtradas del médico:', physicianAppointments);
          
          this.appointments = physicianAppointments.map(a => {
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
              isCurrentPhysician: true,
              
              // ✅ NUEVOS CAMPOS de información completa
              reason: a.reason || '',
              specialty: a.specialty || this.currentUser?.specialty || '',
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
              
              // ✅ Detalles adicionales para médicos
              duration: a.duration || 30,
              location: a.location || 'Consulta externa',
              preparation_notes: a.preparation_notes || '',
              medical_notes: a.medical_notes || ''
            };
          });
          
          console.log('Array final de citas del médico:', this.appointments);
          this.generateCalendar();
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
        }
      });
  }

  getPhysicianInfo(): string {
    if (this.currentUser) {
      return `Dr. ${this.currentUser.name} ${this.currentUser.paternalLastName}`;
    }
    return 'Médico';
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
  
      // ✅ Simplificar ya que todas las citas son del médico actual
      const hasOwnAppointments = sortedAppointments.length > 0;
  
      if (sortedAppointments.length > 0) {
        console.log(`✅ Día ${day} (${dateString}): ${sortedAppointments.length} cita(s) del médico`);
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
        hasOwnAppointments: hasOwnAppointments
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
                             apt.status === 'no_show' ? '#dc3545' : '#17a2b8';
      
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
  
      // ✅ Botones según el estado de la cita (específicos para médicos)
      let actionButtons = '';
      if (apt.status === 'scheduled') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="confirmAppointment(${apt.id})" style="background: #0d6efd; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Confirmar</button>
              <button onclick="addMedicalNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Agregar Notas</button>
              <button onclick="cancelAppointment(${apt.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✗ Cancelar</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'confirmed') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="completeAppointment(${apt.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✓ Completar Consulta</button>
              <button onclick="markNoShow(${apt.id})" style="background: #ffc107; color: black; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">⚠️ No Asistió</button>
              <button onclick="addMedicalNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Notas Médicas</button>
              <button onclick="cancelAppointment(${apt.id})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">✗ Cancelar</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'completed') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="viewMedicalRecord(${apt.id})" style="background: #17a2b8; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📋 Ver Expediente</button>
              <button onclick="addMedicalNotes(${apt.id})" style="background: #6f42c1; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📝 Agregar Notas</button>
            </div>
          </div>
        `;
      } else if (apt.status === 'cancelled' || apt.status === 'no_show') {
        actionButtons = `
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
              <button onclick="reactivateAppointment(${apt.id})" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">🔄 Reactivar</button>
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
  
          <!-- Información del paciente -->
          <div style="margin-bottom: 0.5rem;">
            <div style="font-weight: bold;">👤 Paciente: ${apt.patient}</div>
            ${apt.patient_phone ? `<div style="font-size: 0.8rem; opacity: 0.8;">📞 ${apt.patient_phone}</div>` : ''}
            ${apt.patient_email ? `<div style="font-size: 0.8rem; opacity: 0.8;">📧 ${apt.patient_email}</div>` : ''}
          </div>
  
          <!-- Detalles de la consulta -->
          <div style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
            ${apt.reason ? `<div style="margin-bottom: 0.25rem;"><strong>📝 Motivo:</strong> ${apt.reason}</div>` : ''}
            ${apt.duration ? `<div style="margin-bottom: 0.25rem;"><strong>⏱️ Duración:</strong> ${apt.duration} minutos</div>` : ''}
            ${apt.location ? `<div style="margin-bottom: 0.25rem;"><strong>📍 Ubicación:</strong> ${apt.location}</div>` : ''}
            ${apt.specialty ? `<div style="margin-bottom: 0.25rem;"><strong>🏥 Especialidad:</strong> ${apt.specialty}</div>` : ''}
          </div>
  
          <!-- Notas médicas -->
          ${apt.medical_notes ? `
            <div style="background: rgba(106, 90, 205, 0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>🩺 Notas Médicas:</strong><br>
              <em>${apt.medical_notes}</em>
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
              <div>El paciente no se presentó a la consulta programada</div>
              ${apt.updated_at ? `<div><strong>Fecha de registro:</strong> ${new Date(apt.updated_at).toLocaleDateString('es-ES')}</div>` : ''}
            </div>
          ` : ''}
  
          <!-- Fechas de seguimiento -->
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; opacity: 0.8;">
            ${apt.created_at ? `<div>📅 Creada: ${new Date(apt.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
            ${apt.updated_at && apt.updated_at !== apt.created_at ? `<div>🔄 Actualizada: ${new Date(apt.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
          </div>
  
          <!-- Botones de acción para médicos -->
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
  
    // ✅ ACTUALIZAR: Resumen de estado incluyendo no_show
    const cancelledCount = calDay.allAppointments.filter((apt: any) => apt.status === 'cancelled').length;
    const noShowCount = calDay.allAppointments.filter((apt: any) => apt.status === 'no_show').length;
    const activeCount = calDay.allAppointments.filter((apt: any) => apt.status !== 'cancelled' && apt.status !== 'no_show').length;
    const completedCount = calDay.allAppointments.filter((apt: any) => apt.status === 'completed').length;
    const confirmedCount = calDay.allAppointments.filter((apt: any) => apt.status === 'confirmed').length;
    
    const statusSummary = `
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; color: #666;">
        <div style="font-weight: bold; margin-bottom: 0.5rem; color: #333;">
          📊 Resumen del día: ${calDay.allAppointments.length} consulta(s)
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
  
    // ✅ Definir funciones globales para médicos
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
      Swal.close(); // Cerrar el modal actual
      setTimeout(() => {
        this.cancelAppointmentWithReason(appointmentId); // Abrir el modal de cancelación
      }, 100);
    };
  
    (window as any).reactivateAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };
  
    (window as any).addMedicalNotes = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.addMedicalNotes(appointmentId);
      }, 100);
    };
  
    (window as any).viewMedicalRecord = (appointmentId: number) => {
      Swal.close();
      setTimeout(() => {
        this.viewMedicalRecord(appointmentId);
      }, 100);
    };
  
    Swal.fire({
      title: `🩺 Mis Consultas del ${dateFormatted}`,
      html: `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          ${statusSummary}
          ${appointmentsHtml}
        </div>
      `,
      width: '800px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    });
  }

  addMedicalNotes(appointmentId: number) {
    const appointment = this.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    Swal.fire({
      title: `📝 Agregar Notas Médicas`,
      html: `
        <div style="text-align: left;">
          <p><strong>Paciente:</strong> ${appointment.patient}</p>
          <p><strong>Fecha:</strong> ${appointment.date} - ${appointment.time}</p>
          <p><strong>Motivo:</strong> ${appointment.reason || 'No especificado'}</p>
        </div>
      `,
      input: 'textarea',
      inputPlaceholder: 'Escriba sus notas médicas aquí...',
      inputValue: appointment.medical_notes || '',
      showCancelButton: true,
      confirmButtonText: 'Guardar Notas',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      inputValidator: (value) => {
        if (!value || value.trim().length < 10) {
          return 'Las notas deben tener al menos 10 caracteres';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.saveMedicalNotes(appointmentId, result.value);
      }
    });
  }
  
  // ✅ NUEVO: Guardar notas médicas
  saveMedicalNotes(appointmentId: number, notes: string) {
    const updateData = {
      medical_notes: notes,
      updated_at: new Date().toISOString()
    };
  
    this.adminSvc.updateAppointmentNotes(appointmentId, updateData)
      .subscribe({
        next: (response: any) => { // ✅ Tipo explícito
          console.log('Notas médicas guardadas:', response);
          this.loadAppointments(); // Recargar para mostrar las notas
          Swal.fire({
            title: '✅ Notas Guardadas',
            text: 'Las notas médicas han sido guardadas correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        error: (error: any) => { // ✅ Tipo explícito
          console.error('Error guardando notas:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar las notas médicas. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }
  
  // ✅ NUEVO: Ver expediente médico del paciente
  viewMedicalRecord(appointmentId: number) {
    const appointment = this.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
  
    // Obtener historial de citas del paciente
    const patientHistory = this.appointments.filter(apt => 
      apt.patientId === appointment.patientId && apt.status === 'completed'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
    const historyHtml = patientHistory.length > 0 ? 
      patientHistory.map(apt => `
        <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 4px; margin: 0.5rem 0; border-left: 3px solid #28a745;">
          <div style="font-weight: bold;">📅 ${apt.date} - ${apt.time}</div>
          ${apt.reason ? `<div><strong>Motivo:</strong> ${apt.reason}</div>` : ''}
          ${apt.medical_notes ? `<div><strong>Notas:</strong> ${apt.medical_notes}</div>` : ''}
        </div>
      `).join('') : 
      '<p style="color: #666; font-style: italic;">No hay consultas previas registradas</p>';
  
    Swal.fire({
      title: `📋 Expediente Médico - ${appointment.patient}`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #1976d2;">ℹ️ Información del Paciente</h4>
            <p><strong>Nombre:</strong> ${appointment.patient}</p>
            ${appointment.patient_phone ? `<p><strong>Teléfono:</strong> ${appointment.patient_phone}</p>` : ''}
            ${appointment.patient_email ? `<p><strong>Email:</strong> ${appointment.patient_email}</p>` : ''}
          </div>
          
          <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #388e3c;">🩺 Consulta Actual</h4>
            <p><strong>Fecha:</strong> ${appointment.date} - ${appointment.time}</p>
            <p><strong>Motivo:</strong> ${appointment.reason || 'No especificado'}</p>
            <p><strong>Estado:</strong> ${appointment.status === 'completed' ? 'Completada' : 'En proceso'}</p>
            ${appointment.medical_notes ? `<p><strong>Notas:</strong> ${appointment.medical_notes}</p>` : ''}
          </div>
          
          <div>
            <h4 style="margin: 0 0 0.5rem 0; color: #666;">📖 Historial de Consultas</h4>
            ${historyHtml}
          </div>
        </div>
      `,
      width: '700px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      showCancelButton: true,
      cancelButtonText: 'Agregar Notas',
      cancelButtonColor: '#6f42c1'
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        this.addMedicalNotes(appointmentId);
      }
    });
  }
  

  updateAppointmentStatus(appointmentId: number, status: string) {
    const statusTexts = {
      'completed': 'completada',
      'cancelled': 'cancelada',
      'scheduled': 'reactivada',
      'confirmed': 'confirmada',
      'no_show': 'marcada como no asistió'
    };
  
    this.adminSvc.updateAppointmentStatus(appointmentId, status)
      .subscribe({
        next: (response: any) => { // ✅ Tipo explícito
          console.log('Estado actualizado:', response);
          this.loadAppointments(); // Recargar calendario
          
          let message = `La consulta ha sido ${statusTexts[status as keyof typeof statusTexts]} correctamente`;
          let icon: 'success' | 'warning' | 'info' = 'success';
          
          if (status === 'completed') {
            message = '✅ ¡Consulta completada! Se ha registrado en el expediente del paciente.';
          } else if (status === 'no_show') {
            message = '⚠️ Se ha registrado que el paciente no asistió a la consulta.';
            icon = 'warning';
          } else if (status === 'confirmed') {
            message = '✓ Consulta confirmada. El paciente ha sido notificado.';
            icon = 'info';
          }
          
          Swal.fire({
            title: '¡Estado actualizado!',
            text: message,
            icon: icon,
            confirmButtonText: 'Aceptar',
            timer: 3000,
            timerProgressBar: true
          });
        },
        error: (error: any) => { // ✅ Tipo explícito
          console.error('Error actualizando estado:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudo actualizar el estado de la consulta',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      });
  }
  // ✅ Cancelar cita con motivo
  cancelAppointmentWithReason(appointmentId: number) {
    const appointment = this.appointments.find(apt => apt.id === appointmentId);
    
    Swal.fire({
      title: '❌ Cancelar Consulta',
      html: `
        <div style="text-align: left; margin-bottom: 1rem;">
          <div style="background: #fff3cd; padding: 0.75rem; border-radius: 8px; border-left: 4px solid #ffc107;">
            <strong>⚠️ Consulta a cancelar:</strong><br>
            <div style="margin-top: 0.5rem;">
              <div>👤 <strong>Paciente:</strong> ${appointment?.patient || 'No disponible'}</div>
              <div>📅 <strong>Fecha:</strong> ${appointment?.date || 'No disponible'}</div>
              <div>🕐 <strong>Hora:</strong> ${appointment?.time || 'No disponible'}</div>
              ${appointment?.reason ? `<div>📝 <strong>Motivo:</strong> ${appointment.reason}</div>` : ''}
            </div>
          </div>
        </div>
        <div style="text-align: left;">
          <label style="font-weight: bold; margin-bottom: 0.5rem; display: block;">
            📋 Seleccione el motivo de cancelación:
          </label>
        </div>
      `,
      input: 'select',
      inputOptions: {
        'patient_request': '👤 Solicitud del paciente',
        'physician_unavailable': '👨‍⚕️ Médico no disponible',
        'emergency': '🚨 Emergencia médica',
        'illness': '🤒 Enfermedad del médico',
        'schedule_conflict': '📅 Conflicto de horarios',
        'equipment_failure': '🔧 Falla de equipos médicos',
        'administrative': '📋 Motivos administrativos',
        'other': '➕ Otro motivo'
      },
      inputPlaceholder: 'Seleccione un motivo...',
      showCancelButton: true,
      confirmButtonText: '❌ Cancelar Consulta',
      cancelButtonText: '🔙 Mantener Consulta',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      width: '600px',
      allowOutsideClick: false, // ✅ Evitar que se cierre por clic externo
      allowEscapeKey: false,    // ✅ Evitar que se cierre con ESC
      inputValidator: (value) => {
        if (!value) {
          return '⚠️ Debe seleccionar un motivo para cancelar la consulta';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Si selecciona "Otro motivo", pedir descripción adicional
        if (result.value === 'other') {
          Swal.fire({
            title: '✏️ Especificar Motivo',
            html: `
              <div style="text-align: left; margin-bottom: 1rem;">
                <p style="margin-bottom: 0.5rem;"><strong>📝 Describa detalladamente el motivo de cancelación:</strong></p>
                <small style="color: #666;">Esta información será registrada en el historial de la consulta.</small>
              </div>
            `,
            input: 'textarea',
            inputPlaceholder: 'Ejemplo: El paciente tuvo una emergencia familiar y no puede asistir...',
            showCancelButton: true,
            confirmButtonText: '✅ Confirmar Cancelación',
            cancelButtonText: '🔙 Volver Atrás',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            width: '600px',
            allowOutsideClick: false,
            allowEscapeKey: false,
            inputValidator: (value) => {
              if (!value || value.trim().length < 10) {
                return '⚠️ Debe especificar el motivo (mínimo 10 caracteres)';
              }
              return null;
            }
          }).then((reasonResult) => {
            if (reasonResult.isConfirmed) {
              this.cancelAppointmentWithDetails(appointmentId, 'other', reasonResult.value);
            } else if (reasonResult.dismiss === Swal.DismissReason.cancel) {
              // Volver al selector de motivos
              setTimeout(() => {
                this.cancelAppointmentWithReason(appointmentId);
              }, 100);
            }
          });
        } else {
          // Motivo predefinido seleccionado
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
      cancelled_by: this.physicianId,
      cancelled_at: new Date().toISOString()
    };
  
    this.adminSvc.cancelAppointment(appointmentId, cancelData)
      .subscribe({
        next: (response: any) => { // ✅ Tipo explícito
          console.log('Cita cancelada:', response);
          this.loadAppointments(); // Recargar calendario
          Swal.fire({
            title: '¡Cita cancelada!',
            text: 'La cita ha sido cancelada y se notificará al paciente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error: any) => { // ✅ Tipo explícito
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
    if (!this.newAppt.patient_id || !this.newAppt.date || !this.newAppt.time) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos obligatorios',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
  
    if (!this.physicianId) {
      Swal.fire({
        title: 'Error de Sesión',
        text: 'No se pudo identificar al médico. Inicie sesión nuevamente.',
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
      physician_id: this.physicianId,
      date: this.newAppt.date,
      time: this.newAppt.time,
      reason: this.newAppt.reason,
      priority: this.newAppt.priority,
      duration: this.newAppt.duration,
      preparation_notes: this.newAppt.preparation_notes,
      specialty: this.currentUser?.specialty || '',
      status: 'scheduled',
      location: 'Consulta externa'
    };
    console.log('Enviando cita completa:', appointmentData);
    
    this.adminSvc.createAppointment(appointmentData)
    .subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.loadAppointments();
        
        // ✅ Limpiar formulario incluyendo nuevos campos
        this.newAppt = { 
          patient_id: '', 
          physician_id: this.physicianId, 
          date: '', 
          time: '', 
          reason: '',
          priority: 'normal',
          duration: 30,
          preparation_notes: ''
        };
        this.searchPatient = '';
        
        // ✅ Mensaje de confirmación mejorado
        Swal.fire({
          title: '✅ ¡Consulta agendada con éxito!',
          html: `
            <div style="text-align: left;">
              <p><strong>Consulta programada:</strong></p>
              <div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #28a745;">
                <div style="margin-bottom: 0.5rem;">📅 <strong>Fecha:</strong> ${appointmentData.date}</div>
                <div style="margin-bottom: 0.5rem;">🕐 <strong>Hora:</strong> ${appointmentData.time}</div>
                <div style="margin-bottom: 0.5rem;">👤 <strong>Paciente:</strong> ${this.filteredPatients.find(p => p.id.toString() === this.newAppt.patient_id)?.fullName}</div>
                <div style="margin-bottom: 0.5rem;">⏱️ <strong>Duración:</strong> ${appointmentData.duration} minutos</div>
                ${appointmentData.reason ? `<div style="margin-bottom: 0.5rem;">📝 <strong>Motivo:</strong> ${appointmentData.reason}</div>` : ''}
                <div style="margin-bottom: 0.5rem;">⚡ <strong>Prioridad:</strong> ${appointmentData.priority === 'urgent' ? 'Urgente' : appointmentData.priority === 'high' ? 'Alta' : 'Normal'}</div>
              </div>
              <div style="background: #cff4fc; padding: 0.75rem; border-radius: 8px; border-left: 4px solid #0dcaf0;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">📋 Recordatorios:</div>
                <ul style="margin: 0; padding-left: 1.5rem;">
                  <li>El paciente será notificado automáticamente</li>
                  <li>Confirme la cita antes del día programado</li>
                  <li>Prepare el expediente médico del paciente</li>
                  ${appointmentData.priority === 'urgent' ? '<li style="color: #dc3545;"><strong>⚠️ CONSULTA URGENTE - Prioridad alta</strong></li>' : ''}
                </ul>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
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
              text: 'Ya tiene una cita agendada en esa fecha y hora. Por favor seleccione otro horario.',
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

  goToPhysicianDashboard() {
    this.router.navigate(['/physician-dashboard']);
  }
}