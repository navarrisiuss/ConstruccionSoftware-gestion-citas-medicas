// ✅ REEMPLAZAR medical-history.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../../services/appointments.service';
import { PatientService } from '../../../services/patient.service';
import { PhysicianService } from '../../../services/physician.service';
import { DatePipe, NgForOf, NgClass, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, map, mergeMap, of } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  templateUrl: './medical-history.component.html',
  styleUrls: ['./medical-history.component.css'],
  imports: [NgForOf, NgClass, NgIf, SlicePipe, FormsModule],
  providers: [DatePipe],
})
export class MedicalHistoryComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  availableSpecialties: string[] = [];

  // Filtros
  searchTerm: string = '';
  statusFilter: string = '';
  specialtyFilter: string = '';
  priorityFilter: string = '';

  // Ordenamiento
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private appointmentsService: AppointmentsService,
    private patientService: PatientService,
    private physicianService: PhysicianService,
    private datePipe: DatePipe,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentsService
      .getAllAppointments()
      .pipe(
        mergeMap((appointments) => {
          const detailedAppointments$ = appointments.map((app) => {
            // ✅ Corregir el formateo de fecha para que coincida con las expectativas del test
            const formattedDate = this.formatDateCorrectly(app.date);
            const formattedTime = this.formatTime(app.time);

            const patient$ = app.patient_id
              ? this.patientService.getPatientById(app.patient_id)
              : of({
                  name: 'Desconocido',
                  paternalLastName: '',
                  maternalLastName: '',
                });

            const physician$ = app.physician_id
              ? this.physicianService.getPhysicianById(app.physician_id)
              : of({
                  name: 'Desconocido',
                  paternalLastName: '',
                  specialty: '',
                });

            return forkJoin([patient$, physician$]).pipe(
              map(([patient, physician]) => ({
                ...app,
                formattedDate,
                formattedTime,
                patientName:
                  `${patient.name} ${patient.paternalLastName} ${patient.maternalLastName}`.trim(),
                physicianName:
                  `Dr. ${(physician as any).name} ${(physician as any).paternalLastName}`.trim(),
              }))
            );
          });

          return forkJoin(detailedAppointments$);
        })
      )
      .subscribe({
        next: (detailedAppointments) => {
          this.appointments = detailedAppointments;
          this.filteredAppointments = [...this.appointments];
          this.extractSpecialties();
        },
        error: (error) => {
          console.error('Error al cargar historial médico:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo cargar el historial médico',
            confirmButtonColor: '#3085d6',
          });
        },
      });
  }

  // ✅ Nuevo método para formatear fechas correctamente
  private formatDateCorrectly(dateString: string): string {
    if (!dateString) return '';

    // Si la fecha viene en formato ISO (2024-01-15T00:00:00Z o 2024-01-15)
    const date = new Date(dateString);

    // Obtener día, mes y año
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  private extractSpecialties(): void {
    const specialties = [
      ...new Set(this.appointments.map((app) => app.specialty)),
    ]
      .filter((specialty) => specialty && specialty !== 'No especificada')
      .sort();
    this.availableSpecialties = specialties;
  }

  // Filtros y búsqueda
  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter((appointment) => {
      const matchesSearch =
        !this.searchTerm ||
        appointment.patientName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        appointment.physicianName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        appointment.reason
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter || appointment.status === this.statusFilter;
      const matchesSpecialty =
        !this.specialtyFilter || appointment.specialty === this.specialtyFilter;
      const matchesPriority =
        !this.priorityFilter || appointment.priority === this.priorityFilter;

      return (
        matchesSearch && matchesStatus && matchesSpecialty && matchesPriority
      );
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.specialtyFilter = '';
    this.priorityFilter = '';
    this.filteredAppointments = [...this.appointments];
  }

  // Ordenamiento
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredAppointments.sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      if (field === 'formattedDate') {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Estadísticas
  getCompletedCount(): number {
    return this.appointments.filter((apt) => apt.status === 'completed').length;
  }

  getCancelledCount(): number {
    return this.appointments.filter((apt) => apt.status === 'cancelled').length;
  }

  getUniquePatients(): number {
    const uniquePatients = new Set(
      this.appointments.map((apt) => apt.patient_id)
    );
    return uniquePatients.size;
  }

  getUniquePhysicians(): number {
    const uniquePhysicians = new Set(
      this.appointments.map((apt) => apt.physician_id)
    );
    return uniquePhysicians.size;
  }

  // Utilidades de formato
  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  }

  // Métodos para iconos y texto
  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed':
        return 'fas fa-check-circle';
      case 'cancelled':
        return 'fas fa-times-circle';
      case 'scheduled':
        return 'fas fa-clock';
      case 'confirmed':
        return 'fas fa-calendar-check';
      default:
        return 'fas fa-question-circle';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'scheduled':
        return 'Programada';
      case 'confirmed':
        return 'Confirmada';
      default:
        return status;
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'fas fa-exclamation-triangle';
      case 'normal':
        return 'fas fa-minus-circle';
      case 'low':
        return 'fas fa-chevron-down';
      default:
        return 'fas fa-circle';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'normal':
        return 'Normal';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  }

  // Navegación
  goToAdminDashboard(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  // Acciones
  viewAppointmentDetails(appointment: any): void {
    Swal.fire({
      title: 'Detalles de la Cita',
      html: `
        <div class="appointment-details" style="text-align: left;">
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Paciente:</strong> ${appointment.patientName}
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Médico:</strong> ${appointment.physicianName}
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Especialidad:</strong> ${appointment.specialty}
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Fecha:</strong> ${
              appointment.formattedDate
            } (${this.getDayOfWeek(appointment.date)})
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Hora:</strong> ${appointment.formattedTime}
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Estado:</strong> 
            <span class="status-badge status-${appointment.status}">
              <i class="${this.getStatusIcon(appointment.status)}"></i>
              ${this.getStatusText(appointment.status)}
            </span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Prioridad:</strong>
            <span class="priority-badge priority-${
              appointment.priority || 'normal'
            }">
              <i class="${this.getPriorityIcon(
                appointment.priority || 'normal'
              )}"></i>
              ${this.getPriorityText(appointment.priority || 'normal')}
            </span>
          </div>
          <div class="detail-row" style="margin-bottom: 10px;">
            <strong>Motivo:</strong> ${appointment.reason}
          </div>
          ${
            appointment.notes
              ? `
            <div class="detail-row">
              <strong>Notas:</strong> ${appointment.notes}
            </div>
          `
              : ''
          }
        </div>
      `,
      width: '600px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      customClass: {
        popup: 'appointment-modal',
      },
    });
  }

  editAppointment(appointment: any): void {
    console.log('Editar cita:', appointment);

    // ✅ Convertir la fecha al formato correcto para el input date (YYYY-MM-DD)
    const formatDateForInput = (dateValue: any): string => {
      if (!dateValue) return '';

      // Si es un objeto Date
      if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
      }

      // Convertir a string si no lo es
      const dateStr = String(dateValue);

      // Si la fecha viene en formato DD/MM/YYYY (formattedDate)
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      // Si la fecha viene en formato ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)
      if (dateStr.includes('-')) {
        return dateStr.split('T')[0]; // Remover la parte de tiempo si existe
      }

      return dateStr;
    };

    // ✅ Formatear la hora para el input time (HH:MM)
    const formatTimeForInput = (timeValue: any): string => {
      if (!timeValue) return '';

      // Convertir a string si no lo es
      const timeStr = String(timeValue);

      // Si la hora ya está en formato HH:MM
      if (timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }

      return timeStr;
    };

    // ✅ Preparar los valores para el formulario
    const inputDate = formatDateForInput(
      appointment.date || appointment.formattedDate
    );
    const inputTime = formatTimeForInput(
      appointment.time || appointment.formattedTime
    );

    console.log('🔍 Debug valores:', {
      originalDate: appointment.date,
      formattedDate: appointment.formattedDate,
      inputDate: inputDate,
      originalTime: appointment.time,
      formattedTime: appointment.formattedTime,
      inputTime: inputTime,
    });

    Swal.fire({
      title: 'Editar Cita Médica',
      html: `
        <div class="edit-appointment-form" style="text-align: left;">
          <div class="patient-info" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #495057;">Editando cita de: ${
              appointment.patientName
            }</h4>
            <div><strong>Médico:</strong> ${appointment.physicianName}</div>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Fecha:</strong></label>
            <input type="date" id="edit-date" class="swal2-input" value="${inputDate}" style="width: 100%; margin: 0;">
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Hora:</strong></label>
            <input type="time" id="edit-time" class="swal2-input" value="${inputTime}" style="width: 100%; margin: 0;">
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Estado:</strong></label>
            <select id="edit-status" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="scheduled" ${
                appointment.status === 'scheduled' ? 'selected' : ''
              }>Programada</option>
              <option value="confirmed" ${
                appointment.status === 'confirmed' ? 'selected' : ''
              }>Confirmada</option>
              <option value="completed" ${
                appointment.status === 'completed' ? 'selected' : ''
              }>Completada</option>
              <option value="cancelled" ${
                appointment.status === 'cancelled' ? 'selected' : ''
              }>Cancelada</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Prioridad:</strong></label>
            <select id="edit-priority" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="low" ${
                appointment.priority === 'low' ? 'selected' : ''
              }>Baja</option>
              <option value="normal" ${
                appointment.priority === 'normal' || !appointment.priority
                  ? 'selected'
                  : ''
              }>Normal</option>
              <option value="high" ${
                appointment.priority === 'high' ? 'selected' : ''
              }>Alta</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px;"><strong>Motivo:</strong></label>
            <textarea id="edit-reason" class="swal2-textarea" style="width: 100%; margin: 0; resize: vertical;" rows="3">${
              appointment.reason || ''
            }</textarea>
          </div>
          
          <div class="form-group">
            <label style="display: block; margin-bottom: 5px;"><strong>Notas:</strong></label>
            <textarea id="edit-notes" class="swal2-textarea" style="width: 100%; margin: 0; resize: vertical;" rows="3">${
              appointment.notes || ''
            }</textarea>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      preConfirm: () => {
        const date = (document.getElementById('edit-date') as HTMLInputElement)
          .value;
        const time = (document.getElementById('edit-time') as HTMLInputElement)
          .value;
        const status = (
          document.getElementById('edit-status') as HTMLSelectElement
        ).value;
        const priority = (
          document.getElementById('edit-priority') as HTMLSelectElement
        ).value;
        const reason = (
          document.getElementById('edit-reason') as HTMLTextAreaElement
        ).value;
        const notes = (
          document.getElementById('edit-notes') as HTMLTextAreaElement
        ).value;

        if (!date || !time) {
          Swal.showValidationMessage('Por favor complete la fecha y hora');
          return false;
        }

        if (!reason.trim()) {
          Swal.showValidationMessage('Por favor ingrese el motivo de la cita');
          return false;
        }

        // ✅ Validar que la fecha no sea anterior a hoy (opcional)
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
          selectedDate < today &&
          status !== 'completed' &&
          status !== 'cancelled'
        ) {
          Swal.showValidationMessage(
            'No se puede programar una cita en una fecha pasada'
          );
          return false;
        }

        return {
          date,
          time,
          status,
          priority,
          reason: reason.trim(),
          notes: notes.trim(),
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // ✅ Mostrar loading mientras se actualiza
        Swal.fire({
          title: 'Actualizando...',
          text: 'Guardando los cambios de la cita',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        });

        const updatedAppointment = {
          ...appointment,
          ...result.value,
        };

        this.appointmentsService
          .updateAppointment(appointment.id, updatedAppointment)
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'La cita ha sido actualizada correctamente',
                confirmButtonColor: '#28a745',
                timer: 2000,
                timerProgressBar: true,
              });
              this.loadAppointments(); // Recargar la lista
            },
            error: (error) => {
              console.error('Error al actualizar la cita:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error al actualizar',
                text: 'No se pudo actualizar la cita. Por favor intente nuevamente.',
                confirmButtonColor: '#dc3545',
                footer: error.message
                  ? `<small>Detalle: ${error.message}</small>`
                  : '',
              });
            },
          });
      }
    });
  }
}
