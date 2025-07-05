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
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-appointment-calendar-form',
  templateUrl: './appointment-calendar-form.component.html',
  styleUrls: ['./appointment-calendar-form.component.css']
})
export class AppointmentCalendarFormComponent implements OnInit {
  newAppt = { patient_id: '', physician_id: '', date: '', time: '', reason: '' };
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
            
            const mappedAppointment = {
              id: a.id,
              date: formattedDate,
              time: a.time,
              physician: a.physician_name || 'Sin nombre',
              patient: a.patient_name || 'Sin nombre',
              patientId: a.patient_id,
              physicianId: a.physician_id,
              status: a.status,
              isCurrentPhysician: true // ✅ Todas son del médico actual
            };
            
            return mappedAppointment;
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
      const statusText = apt.status === 'cancelled' ? ' (Cancelada)' : 
                        apt.status === 'completed' ? ' (Completada)' : 
                        apt.status === 'confirmed' ? ' (Confirmada)' : '';
      
      // ✅ Botones según el estado de la cita
      let actionButtons = '';
      if (apt.status === 'scheduled' || apt.status === 'confirmed') {
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
      
      return `
        <div class="modal-appointment-item current-physician" style="
          background: ${apt.status === 'cancelled' ? '#dc3545' : 
                       apt.status === 'completed' ? '#17a2b8' : '#28a745'};
          color: white;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 6px;
          border-left: 4px solid ${apt.status === 'cancelled' ? '#a71e2a' : 
                                   apt.status === 'completed' ? '#117a8b' : '#198754'};
        ">
          <div style="font-weight: bold; font-size: 1rem;">
            🕐 ${apt.time}
          </div>
          <div style="margin-top: 0.25rem;">
            👤 ${apt.patient}
          </div>
          <div style="margin-top: 0.25rem; font-size: 0.9rem; color: #e8f5e8;">
            👨‍⚕️ Mi Consulta${statusText}
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

    // ✅ Hacer las funciones globales temporalmente
    (window as any).completeAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'completed');
      Swal.close();
    };

    (window as any).cancelAppointment = (appointmentId: number) => {
      this.cancelAppointmentWithReason(appointmentId);
      Swal.close();
    };

    (window as any).reactivateAppointment = (appointmentId: number) => {
      this.updateAppointmentStatus(appointmentId, 'scheduled');
      Swal.close();
    };

    Swal.fire({
      title: `📅 Mis Citas del ${dateFormatted}`,
      html: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <p style="margin-bottom: 1rem; color: #666; text-align: center;">
            <strong>${calDay.allAppointments.length}</strong> consulta(s) programada(s)
          </p>
          ${appointmentsHtml}
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#28a745',
      showCloseButton: true
    });
  }

  // ✅ Completar cita
  updateAppointmentStatus(appointmentId: number, status: string) {
    const statusTexts = {
      'completed': 'completada',
      'cancelled': 'cancelada',
      'scheduled': 'reactivada',
      'confirmed': 'confirmada'
    };

    this.adminSvc.updateAppointmentStatus(appointmentId, status)
      .subscribe({
        next: (response) => {
          console.log('Estado actualizado:', response);
          this.loadAppointments(); // Recargar calendario
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
    Swal.fire({
      title: 'Cancelar Cita',
      text: 'Seleccione el motivo de cancelación:',
      input: 'select',
      inputOptions: {
        'patient_request': 'Solicitud del paciente',
        'physician_unavailable': 'Médico no disponible',
        'emergency': 'Emergencia médica',
        'illness': 'Enfermedad del médico',
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
      if (result.isConfirmed) {
        // Si selecciona "Otro motivo", pedir descripción adicional
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

  // ✅ Cancelar con detalles específicos
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
        next: (response) => {
          console.log('Cita cancelada:', response);
          this.loadAppointments(); // Recargar calendario
          Swal.fire({
            title: '¡Cita cancelada!',
            text: 'La cita ha sido cancelada y se notificará al paciente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
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
  
    this.newAppt.physician_id = this.physicianId;
    console.log('Enviando cita:', this.newAppt);
    
    this.adminSvc.createAppointment(this.newAppt)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          this.loadAppointments();
          this.newAppt = { 
            patient_id: '', 
            physician_id: this.physicianId, 
            date: '', 
            time: '', 
            reason: '' 
          };
          this.searchPatient = '';
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