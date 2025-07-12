// appointment-form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { PhysicianService } from '../../../../services/physician.service';
import { Router } from '@angular/router';
import { MEDICAL_SPECIALTIES } from '../../../../constants/medical-specialties';

// ✅ Declare Swal as global instead of importing to allow mocking in tests
declare const Swal: any;

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
  physician: string; // Nombre del médico
  patient: string; // Nombre del paciente
  patientId: number; // ID del paciente
  physicianId: number; // ID del médico
  status?: string; // Estado de la cita (scheduled, confirmed, completed, cancelled)
  isCurrentPatient: boolean; // Si la cita es del paciente actual
  reason?: string; // Motivo de la consulta
  specialty?: string; // Especialidad médica
  priority?: string; // Prioridad (normal, urgent, etc.)
  notes?: string; // Notas del paciente
  created_at?: string; // Cuándo se creó la cita
  updated_at?: string; // Última actualización
  cancellation_reason?: string; // Motivo de cancelación
  cancellation_details?: string; // Detalles de cancelación
  cancelled_by?: string; // Quién canceló
  cancelled_at?: string; // Cuándo se canceló
  physician_phone?: string; // Teléfono del médico
  physician_email?: string; // Email del médico
  duration?: number; // Duración estimada en minutos
  location?: string; // Ubicación de la consulta
  preparation_notes?: string; // Instrucciones de preparación
}

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css'],
})
export class AppointmentFormComponent implements OnInit {
  newAppt = {
    patient_id: '',
    physician_id: '',
    date: '',
    time: '',
    specialty: '',
    reason: '', // ✅ NUEVO
    priority: 'normal', // ✅ NUEVO
    notes: '', // ✅ NUEVO
  };
  physicians: PhysicianDto[] = [];
  allPhysicians: PhysicianDto[] = [];
  filteredPhysicians: PhysicianDto[] = [];
  specialtyCounts: SpecialtyCount[] = [];

  // ✅ Separar citas del paciente de todas las citas
  patientAppointments: AppointmentEvent[] = []; // Solo las del paciente (para mostrar)
  allAppointments: AppointmentEvent[] = []; // Todas las citas (para validación)

  patientId = '';
  currentUser: any = null;
  medicalSpecialties = MEDICAL_SPECIALTIES;
  currentDate = new Date();
  calendarDays: any[] = [];

  constructor(
    private adminSvc: AdminService,
    private authService: AuthService,
    private physicianService: PhysicianService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser && this.currentUser.id) {
      this.patientId = this.currentUser.id.toString();
      this.newAppt.patient_id = this.patientId;

      this.loadPhysicians();
      this.loadAppointments();
      this.generateCalendar();
    } else {
      Swal.fire({
        title: 'Sesión Expirada',
        text: 'Debe iniciar sesión para agendar citas',
        icon: 'warning',
        confirmButtonText: 'Ir a Login',
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  private loadPhysicians() {
    this.physicianService.getAllPhysicians().subscribe({
      next: (list: any[]) => {
        console.log('Médicos desde el servidor:', list);

        this.allPhysicians = list.map((p) => ({
          id: p.id,
          fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
          specialty: p.specialty,
        }));

        this.physicians = [...this.allPhysicians];
        this.calculateSpecialtyCounts();
      },
      error: (error) => {
        console.error('Error cargando médicos:', error);
      },
    });
  }

  calculateSpecialtyCounts() {
    const counts: { [key: string]: number } = {};

    this.allPhysicians.forEach((physician) => {
      if (physician.specialty) {
        counts[physician.specialty] = (counts[physician.specialty] || 0) + 1;
      }
    });

    this.specialtyCounts = Object.keys(counts).map((specialty) => ({
      specialty,
      count: counts[specialty],
    }));
  }

  getPhysicianCount(specialty: string): number {
    const specialtyCount = this.specialtyCounts.find(
      (sc) => sc.specialty === specialty
    );
    return specialtyCount ? specialtyCount.count : 0;
  }

  onSpecialtyChange() {
    console.log('Especialidad seleccionada:', this.newAppt.specialty);

    if (this.newAppt.specialty) {
      this.filteredPhysicians = this.allPhysicians.filter(
        (p) => p.specialty === this.newAppt.specialty
      );
    } else {
      this.filteredPhysicians = [...this.allPhysicians];
    }

    if (this.newAppt.physician_id) {
      const selectedPhysicianExists = this.filteredPhysicians.some(
        (p) => p.id && p.id.toString() === this.newAppt.physician_id
      );

      if (!selectedPhysicianExists) {
        this.newAppt.physician_id = '';
      }
    }
  }

  loadAppointments() {
    console.log('Cargando citas...');

    this.adminSvc.getAllAppointments().subscribe({
      next: (list: any[]) => {
        console.log('Todas las citas desde el servidor:', list);

        //Mapear TODAS las citas con información completa
        this.allAppointments = list.map((a) => {
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
            isCurrentPatient: a.patient_id.toString() === this.patientId,

            //NUEVOS CAMPOS de información
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

            //Información del médico (si está disponible)
            physician_phone: a.physician_phone || '',
            physician_email: a.physician_email || '',

            // Detalles adicionales
            duration: a.duration || 30, // Duración por defecto 30 minutos
            location: a.location || 'Consulta externa',
            preparation_notes: a.preparation_notes || '',
          };
        });

        // Filtrar solo las citas del paciente actual
        this.patientAppointments = this.allAppointments.filter(
          (apt) => apt.isCurrentPatient
        );

        console.log(
          'Citas del paciente (completas):',
          this.patientAppointments
        );
        console.log(
          'Total de citas (para validación):',
          this.allAppointments.length
        );

        this.generateCalendar();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
      },
    });
  }

  getPatientInfo(): string {
    if (this.currentUser) {
      return `${this.currentUser.name} ${this.currentUser.paternalLastName}`;
    }
    return 'Usuario';
  }

  generateCalendar() {
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

      const dayAppointments = this.patientAppointments.filter(
        (apt) => apt.date === dateString
      );

      const sortedAppointments = dayAppointments.sort((a, b) =>
        a.time.localeCompare(b.time)
      );
      const visibleAppointments = sortedAppointments.slice(0, 3);
      const hasMoreAppointments = sortedAppointments.length > 3;

      // ✅ ACTUALIZAR: Detectar tipos de citas incluyendo no_show
      const cancelledCount = sortedAppointments.filter(
        (apt) => apt.status === 'cancelled'
      ).length;
      const noShowCount = sortedAppointments.filter(
        (apt) => apt.status === 'no_show'
      ).length;
      const activeCount = sortedAppointments.filter(
        (apt) => apt.status !== 'cancelled' && apt.status !== 'no_show'
      ).length;
      const completedCount = sortedAppointments.filter(
        (apt) => apt.status === 'completed'
      ).length;

      // ✅ ACTUALIZAR: Determinar clases CSS según el estado
      let dayClass = '';
      let statusIndicator = '';

      if (sortedAppointments.length > 0) {
        if (cancelledCount + noShowCount > 0 && activeCount > 0) {
          dayClass = 'mixed-status';
          statusIndicator = 'mixed';
        } else if (cancelledCount + noShowCount === sortedAppointments.length) {
          dayClass = 'only-cancelled';
          statusIndicator = 'has-cancelled';
        } else if (activeCount > 0) {
          dayClass = 'has-appointments';
          statusIndicator = 'has-active';
        }
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
        hasAppointments: sortedAppointments.length > 0,
        dayClass: dayClass,
        statusIndicator: statusIndicator,
        cancelledCount: cancelledCount,
        noShowCount: noShowCount, // ✅ NUEVO
        activeCount: activeCount,
        completedCount: completedCount,
        hasCancelled: cancelledCount > 0,
        hasNoShow: noShowCount > 0, // ✅ NUEVO
        hasActive: activeCount > 0,
        hasCompleted: completedCount > 0,
      });
    }
  }

  showDayDetails(calDay: any) {
    if (!calDay.allAppointments || calDay.allAppointments.length === 0) {
      return;
    }

    const appointmentsHtml = calDay.allAppointments
      .map((apt: any) => {
        const backgroundColor =
          apt.status === 'cancelled'
            ? '#dc3545'
            : apt.status === 'completed'
              ? '#28a745'
              : apt.status === 'confirmed'
                ? '#0d6efd'
                : apt.status === 'no_show'
                  ? '#dc3545'
                  : '#17a2b8';

        // ✅ CORREGIR: Usar operador ternario correcto
        const statusText =
          apt.status === 'cancelled'
            ? 'CANCELADA'
            : apt.status === 'completed'
              ? 'COMPLETADA'
              : apt.status === 'confirmed'
                ? 'CONFIRMADA'
                : apt.status === 'scheduled'
                  ? 'PROGRAMADA'
                  : apt.status === 'no_show'
                    ? 'NO ASISTIÓ'
                    : 'PENDIENTE';

        // ✅ Definir prioridades con colores
        const priorityColors = {
          urgent: '#dc3545',
          high: '#fd7e14',
          normal: '#28a745',
          low: '#6c757d',
        };

        const priorityColor =
          priorityColors[apt.priority as keyof typeof priorityColors] ||
          '#28a745';
        const priorityText =
          apt.priority === 'urgent'
            ? 'URGENTE'
            : apt.priority === 'high'
              ? 'ALTA'
              : apt.priority === 'low'
                ? 'BAJA'
                : 'NORMAL';

        // ✅ Estilo especial para citas canceladas Y no_show
        const extraStyle =
          apt.status === 'cancelled' || apt.status === 'no_show'
            ? 'text-decoration: line-through; opacity: 0.9; border: 2px solid #a71e2a;'
            : '';

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
              🕐 ${apt.time} ${apt.status === 'cancelled' || apt.status === 'no_show' ? '❌' : ''}
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
  
          <!-- Información del médico -->
          <div style="margin-bottom: 0.5rem;">
            <div style="font-weight: bold;">👨‍⚕️/👩‍⚕️ Dr. ${apt.physician}</div>
            ${apt.specialty ? `<div style="font-size: 0.9rem; opacity: 0.9;">🏥 ${apt.specialty}</div>` : ''}
            ${apt.physician_phone ? `<div style="font-size: 0.8rem; opacity: 0.8;">📞 ${apt.physician_phone}</div>` : ''}
          </div>
  
          <!-- Detalles de la cita -->
          <div style="background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
            ${apt.reason ? `<div style="margin-bottom: 0.25rem;"><strong>📝 Motivo:</strong> ${apt.reason}</div>` : ''}
            ${apt.duration ? `<div style="margin-bottom: 0.25rem;"><strong>⏱️ Duración:</strong> ${apt.duration} minutos</div>` : ''}
            ${apt.location ? `<div style="margin-bottom: 0.25rem;"><strong>📍 Ubicación:</strong> ${apt.location}</div>` : ''}
            ${apt.notes ? `<div style="margin-bottom: 0.25rem;"><strong>📋 Notas:</strong> ${apt.notes}</div>` : ''}
          </div>
  
          <!-- Información de preparación -->
          ${
            apt.preparation_notes
              ? `
            <div style="background: rgba(255,255,255,0.1); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>⚠️ Instrucciones de preparación:</strong><br>
              <em>${apt.preparation_notes}</em>
            </div>
          `
              : ''
          }
  
          <!-- ✅ CORREGIR: Información de cancelación O no_show -->
          ${
            apt.status === 'cancelled'
              ? `
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>❌ Información de cancelación:</strong><br>
              ${apt.cancellation_reason ? `<div><strong>Motivo:</strong> ${apt.cancellation_reason}</div>` : ''}
              ${apt.cancellation_details ? `<div><strong>Detalles:</strong> ${apt.cancellation_details}</div>` : ''}
              ${apt.cancelled_by ? `<div><strong>Cancelado por:</strong> ${apt.cancelled_by}</div>` : ''}
              ${apt.cancelled_at ? `<div><strong>Fecha de cancelación:</strong> ${new Date(apt.cancelled_at).toLocaleDateString('es-ES')}</div>` : ''}
            </div>
          `
              : ''
          }
  
          <!-- ✅ NUEVO: Información de no_show -->
          ${
            apt.status === 'no_show'
              ? `
            <div style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">
              <strong>⚠️ Información de no asistencia:</strong><br>
              <div>El paciente no se presentó a la cita programada</div>
              ${apt.updated_at ? `<div><strong>Fecha de registro:</strong> ${new Date(apt.updated_at).toLocaleDateString('es-ES')}</div>` : ''}
            </div>
          `
              : ''
          }
  
          <!-- Fechas de seguimiento -->
          <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.8rem; opacity: 0.8;">
            ${apt.created_at ? `<div>📅 Creada: ${new Date(apt.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
            ${apt.updated_at && apt.updated_at !== apt.created_at ? `<div>🔄 Actualizada: ${new Date(apt.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>` : ''}
          </div>
  
          <!-- Botones de acción (solo para citas activas) -->
          ${
            apt.status === 'scheduled' || apt.status === 'confirmed'
              ? `
            <div style="margin-top: 0.75rem; padding-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.2); text-align: center;">
              <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 0.25rem;">
                ℹ️ Para reagendar o cancelar, contacte a recepción
              </div>
            </div>
          `
              : ''
          }
        </div>
      `;
      })
      .join('');

    const dateFormatted = new Date(
      calDay.dateString + 'T00:00:00'
    ).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // ✅ CORREGIR: Resumen de estado incluyendo no_show
    const noShowCount = calDay.allAppointments.filter(
      (apt: any) => apt.status === 'no_show'
    ).length;

    const statusSummary = `
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; color: #666;">
        <div style="font-weight: bold; margin-bottom: 0.5rem; color: #333;">
          📊 Resumen del día: ${calDay.allAppointments.length} cita(s)
        </div>
        <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          ${calDay.activeCount > 0 ? `<span style="color: #28a745; font-weight: bold;">✓ ${calDay.activeCount} activa(s)</span>` : ''}
          ${calDay.cancelledCount > 0 ? `<span style="color: #dc3545; font-weight: bold;">❌ ${calDay.cancelledCount} cancelada(s)</span>` : ''}
          ${calDay.completedCount > 0 ? `<span style="color: #17a2b8; font-weight: bold;">📋 ${calDay.completedCount} completada(s)</span>` : ''}
          ${noShowCount > 0 ? `<span style="color: #dc3545; font-weight: bold;">⚠️ ${noShowCount} no asistió</span>` : ''}
        </div>
      </div>
    `;

    Swal.fire({
      title: `📅 Mis Citas del ${dateFormatted}`,
      html: `
        <div style="text-align: left; max-height: 500px; overflow-y: auto;">
          ${statusSummary}
          ${appointmentsHtml}
        </div>
      `,
      width: '700px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#17a2b8',
      showClass: {
        popup: 'animate__animated animate__fadeInDown',
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp',
      },
    });
  }

  submit() {
    if (
      !this.newAppt.physician_id ||
      !this.newAppt.date ||
      !this.newAppt.time
    ) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    if (!this.patientId) {
      Swal.fire({
        title: 'Error de Sesión',
        text: 'No se pudo identificar al paciente. Inicie sesión nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // ✅ Validar fechas pasadas
    const selectedDateStr = this.newAppt.date;
    const todayStr = new Date().toISOString().split('T')[0];

    if (selectedDateStr < todayStr) {
      Swal.fire({
        title: 'Error',
        text: 'No puede agendar citas en fechas pasadas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    // ✅ Validar hora de hoy
    if (selectedDateStr === todayStr) {
      const [hour, minute] = this.newAppt.time.split(':').map(Number);
      const now = new Date();

      if (
        hour < now.getHours() ||
        (hour === now.getHours() && minute <= now.getMinutes())
      ) {
        Swal.fire({
          title: 'Error',
          text: 'No puede agendar una cita en una hora que ya pasó',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        return;
      }
    }

    // ✅ VALIDACIÓN CRÍTICA: Verificar conflictos de horario con el mismo médico
    const selectedPhysicianId = parseInt(this.newAppt.physician_id);
    const conflictingAppointment = this.allAppointments.find(
      (apt) =>
        apt.physicianId === selectedPhysicianId &&
        apt.date === selectedDateStr &&
        apt.time === this.newAppt.time &&
        apt.status !== 'cancelled' // No considerar citas canceladas
    );

    if (conflictingAppointment) {
      const physicianName =
        this.allPhysicians.find((p) => p.id === selectedPhysicianId)
          ?.fullName || 'el médico';

      Swal.fire({
        title: 'Horario no disponible',
        html: `
          <div style="text-align: left;">
            <p>⚠️ <strong>El Dr. ${physicianName}</strong> ya tiene una cita programada para:</p>
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
              📅 <strong>Fecha:</strong> ${selectedDateStr}<br>
              🕐 <strong>Hora:</strong> ${this.newAppt.time}
            </div>
            <p>Por favor seleccione otro horario disponible.</p>
          </div>
        `,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ffc107',
      });
      return;
    }

    const appointmentInfo = {
      date: this.newAppt.date,
      time: this.newAppt.time,
      physicianId: this.newAppt.physician_id,
      physicianName:
        this.allPhysicians.find(
          (p) => p.id.toString() === this.newAppt.physician_id
        )?.fullName || 'Médico no encontrado',
      specialty: this.newAppt.specialty,
      reason: this.newAppt.reason,
      priority: this.newAppt.priority,
      notes: this.newAppt.notes,
    };

    const appointmentData = {
      patient_id: this.patientId,
      physician_id: this.newAppt.physician_id,
      date: this.newAppt.date,
      time: this.newAppt.time,
      reason: this.newAppt.reason,
      priority: this.newAppt.priority,
      notes: this.newAppt.notes,
      specialty: this.newAppt.specialty,
      status: 'scheduled',
      duration: 30, // Duración por defecto
      location: 'Consulta externa', // Ubicación por defecto
    };
    console.log('Enviando cita:', appointmentData);

    this.adminSvc.createAppointment(appointmentData).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        this.loadAppointments();

        // ✅ Limpiar formulario incluyendo nuevos campos
        this.newAppt = {
          patient_id: this.patientId,
          physician_id: '',
          date: '',
          time: '',
          specialty: '',
          reason: '',
          priority: 'normal',
          notes: '',
        };

        this.filteredPhysicians = [...this.allPhysicians];

        const priorityText =
          appointmentInfo.priority === 'urgent'
            ? 'Urgente'
            : appointmentInfo.priority === 'high'
              ? 'Alta'
              : appointmentInfo.priority === 'low'
                ? 'Baja'
                : 'Normal';

        const formattedDate = new Date(
          appointmentInfo.date + 'T00:00:00'
        ).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        Swal.fire({
          title: '✅ ¡Cita creada con éxito!',
          html: `
              <div style="text-align: left;">
                <p><strong>Su cita ha sido agendada:</strong></p>
                <div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #28a745;">
                  <div style="margin-bottom: 0.5rem;">📅 <strong>Fecha:</strong> ${formattedDate}</div>
                  <div style="margin-bottom: 0.5rem;">🕐 <strong>Hora:</strong> ${appointmentInfo.time}</div>
                  <div style="margin-bottom: 0.5rem;">👨‍⚕️/👩‍⚕️ <strong>Médico:</strong> Dr. ${appointmentInfo.physicianName}</div>
                  <div style="margin-bottom: 0.5rem;">🏥 <strong>Especialidad:</strong> ${appointmentInfo.specialty || 'No especificada'}</div>
                  ${appointmentInfo.reason ? `<div style="margin-bottom: 0.5rem;">📝 <strong>Motivo:</strong> ${appointmentInfo.reason}</div>` : ''}
                  <div style="margin-bottom: 0.5rem;">⚡ <strong>Prioridad:</strong> ${priorityText}</div>
                  ${appointmentInfo.notes ? `<div style="margin-bottom: 0.5rem;">📋 <strong>Notas:</strong> ${appointmentInfo.notes}</div>` : ''}
                </div>
                <div style="background: #cff4fc; padding: 0.75rem; border-radius: 8px; border-left: 4px solid #17a2b8;">
                  <div style="font-weight: bold; margin-bottom: 0.5rem;">📋 Próximos pasos:</div>
                  <ul style="margin: 0; padding-left: 1.5rem;">
                    <li>Recibirá confirmación por correo electrónico</li>
                    <li>Llegue 15 minutos antes de su cita</li>
                    <li>Traiga su documento de identidad</li>
                    ${appointmentInfo.specialty ? `<li>Se dirigirá al área de <strong>${appointmentInfo.specialty}</strong></li>` : ''}
                    ${appointmentInfo.priority === 'urgent' ? '<li style="color: #dc3545;"><strong>⚠️ Su cita es URGENTE - Se procesará prioritariamente</strong></li>' : ''}
                  </ul>
                </div>
                ${
                  appointmentInfo.reason &&
                  appointmentInfo.reason.toLowerCase().includes('dolor')
                    ? `
                  <div style="background: #fff3cd; padding: 0.75rem; border-radius: 8px; border-left: 4px solid #ffc107; margin-top: 1rem;">
                    <div style="font-weight: bold; margin-bottom: 0.5rem;">⚠️ Recomendaciones adicionales:</div>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                      <li>Si el dolor se intensifica, contacte inmediatamente</li>
                      <li>Evite medicamentos sin prescripción médica</li>
                    </ul>
                  </div>
                `
                    : ''
                }
              </div>
            `,
          icon: 'success',
          confirmButtonText: 'Entendido',
          width: '650px',
          timer: 10000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        });
      },
      error: (error) => {
        console.error('Error al crear cita:', error);

        if (error.status === 409) {
          Swal.fire({
            title: 'Horario no disponible',
            text: 'El médico ya tiene una cita agendada en esa fecha y hora. Por favor seleccione otro horario.',
            icon: 'warning',
            confirmButtonText: 'Aceptar',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear la cita. Intente nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      },
    });
  }

  isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
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
      year: 'numeric',
    });
  }

  goToPatientDashboard() {
    this.router.navigate(['/patient-dashboard']);
  }
}
