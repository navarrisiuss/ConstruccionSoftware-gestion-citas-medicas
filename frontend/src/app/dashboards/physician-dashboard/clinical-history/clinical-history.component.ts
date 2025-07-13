import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../../services/appointments.service';
import { AuthService } from '../../../services/auth.service';
import { PatientService } from '../../../services/patient.service';
import { NgForOf, NgClass, NgIf, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clinical-history',
  templateUrl: './clinical-history.component.html',
  imports: [NgForOf, NgClass, NgIf, SlicePipe, FormsModule],
  styleUrls: ['./clinical-history.component.css'],
})
export class ClinicalHistoryComponent implements OnInit {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  physicianId!: number;

  // Filtros
  searchTerm: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';

  // Ordenamiento
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.physicianId = currentUser.id;
      this.loadAppointmentsByPhysician();
    } else {
      console.error('No se encontró el médico logueado');
    }
  }

  goToPhysicianDashboard(): void {
    this.router.navigate(['/physician-dashboard']);
  }

  loadAppointmentsByPhysician(): void {
    this.appointmentsService
      .getAppointmentsByPhysician(this.physicianId)
      .subscribe({
        next: (data) => {
          const formattedAppointments = data.map((appointment: any) => {
            return {
              ...appointment,
              date: this.formatDate(appointment.date),
              time: this.formatTime(appointment.time),
              patientFullName: '',
            };
          });

          this.appointments = formattedAppointments;
          this.filteredAppointments = [...this.appointments];

          this.appointments.forEach((appointment, index) => {
            this.patientService
              .getPatientById(appointment.patient_id.toString())
              .subscribe({
                next: (patientData) => {
                  const fullName = `${patientData.name} ${patientData.paternalLastName} ${patientData.maternalLastName}`;
                  this.appointments[index].patientFullName = fullName;
                  this.filteredAppointments = [...this.appointments];
                },
                error: (error) => {
                  console.error(
                    `Error al obtener paciente con ID ${appointment.patient_id}:`,
                    error
                  );
                  this.appointments[index].patientFullName =
                    'Paciente no encontrado';
                  this.filteredAppointments = [...this.appointments];
                },
              });
          });
        },
        error: (error) => {
          console.error('Error al obtener citas:', error);
        },
      });
  }

  // Filtros y búsqueda
  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter((appointment) => {
      const patientName = appointment.patientFullName || '';
      const reason = appointment.reason || '';

      const matchesSearch =
        !this.searchTerm ||
        patientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        reason.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter || appointment.status === this.statusFilter;
      const matchesPriority =
        !this.priorityFilter || appointment.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
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

      if (field === 'date') {
        aValue = new Date(a.date.split('/').reverse().join('-'));
        bValue = new Date(b.date.split('/').reverse().join('-'));
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

  getHighPriorityCount(): number {
    return this.appointments.filter((apt) => apt.priority === 'high').length;
  }

  getUniquePatients(): number {
    const uniquePatients = new Set(
      this.appointments.map((apt) => apt.patient_id)
    );
    return uniquePatients.size;
  }

  // Utilidades de formato
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    // Ajustar por zona horaria para evitar problemas con fechas
    const adjustedDate = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const year = adjustedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  getDayOfWeek(dateString: string): string {
    const [day, month, year] = dateString.split('/');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
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
      default:
        return status;
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return 'fas fa-exclamation-triangle';
      case 'medium':
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
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  }

  // Acciones
  viewAppointmentDetails(appointment: any): void {
    console.log('Ver detalles de cita:', appointment);

    // Verificar que el appointment y patientFullName existan
    if (!appointment) {
      console.error('No se proporcionó información de la cita');
      return;
    }

    const patientName =
      appointment.patientFullName || 'Información del paciente no disponible';

    // Implementar modal swal.fire
    Swal.fire({
      title: 'Detalles de la Cita',
      html: `
      <div class="appointment-details" style="text-align: left;">
        <div class="detail-row">
        <strong>Paciente:</strong> ${patientName}
        </div>
        <div class="detail-row">
        <strong>Fecha:</strong> ${appointment.date} (${this.getDayOfWeek(appointment.date)})
        </div>
        <div class="detail-row">
        <strong>Hora:</strong> ${appointment.time}
        </div>
        <div class="detail-row">
        <strong>Estado:</strong> 
        <span class="status-badge status-${appointment.status}">
          <i class="${this.getStatusIcon(appointment.status)}"></i>
          ${this.getStatusText(appointment.status)}
        </span>
        </div>
        <div class="detail-row">
        <strong>Prioridad:</strong>
        <span class="priority-badge priority-${appointment.priority}">
          <i class="${this.getPriorityIcon(appointment.priority)}"></i>
          ${this.getPriorityText(appointment.priority)}
        </span>
        </div>
        <div class="detail-row">
        <strong>Motivo:</strong> ${appointment.reason || 'No especificado'}
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

    // Verificar que el appointment y patientFullName existan
    if (!appointment) {
      console.error('No se proporcionó información de la cita');
      return;
    }

    const patientName =
      appointment.patientFullName || 'Información del paciente no disponible';

    // Implementar edición de cita
    Swal.fire({
      title: 'Editar Cita',
      html: `
        <div class="edit-appointment-form" style="text-align: left;">
          <div class="patient-info" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #495057;">Paciente: ${patientName}</h4>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fecha:</label>
            <input type="date" id="editDate" class="swal2-input" value="${appointment.date ? appointment.date.split('/').reverse().join('-') : ''}" style="width: 100%; margin: 0;">
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Hora:</label>
            <input type="time" id="editTime" class="swal2-input" value="${appointment.time || ''}" style="width: 100%; margin: 0;">
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Estado:</label>
            <select id="editStatus" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="scheduled" ${appointment.status === 'scheduled' ? 'selected' : ''}>Programada</option>
              <option value="completed" ${appointment.status === 'completed' ? 'selected' : ''}>Completada</option>
              <option value="cancelled" ${appointment.status === 'cancelled' ? 'selected' : ''}>Cancelada</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Prioridad:</label>
            <select id="editPriority" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="low" ${appointment.priority === 'low' ? 'selected' : ''}>Baja</option>
              <option value="medium" ${appointment.priority === 'medium' ? 'selected' : ''}>Media</option>
              <option value="high" ${appointment.priority === 'high' ? 'selected' : ''}>Alta</option>
            </select>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Motivo:</label>
            <textarea id="editReason" class="swal2-textarea" placeholder="Motivo de la cita" style="width: 100%; margin: 0; min-height: 80px;">${appointment.reason || ''}</textarea>
          </div>
          
          <div class="form-group" style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: bold;">Notas:</label>
            <textarea id="editNotes" class="swal2-textarea" placeholder="Notas médicas" style="width: 100%; margin: 0; min-height: 100px;">${appointment.notes || ''}</textarea>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#dc3545',
      customClass: {
        popup: 'edit-appointment-modal',
      },
      preConfirm: () => {
        const date = (document.getElementById('editDate') as HTMLInputElement)
          .value;
        const time = (document.getElementById('editTime') as HTMLInputElement)
          .value;
        const status = (
          document.getElementById('editStatus') as HTMLSelectElement
        ).value;
        const priority = (
          document.getElementById('editPriority') as HTMLSelectElement
        ).value;
        const reason = (
          document.getElementById('editReason') as HTMLTextAreaElement
        ).value;
        const notes = (
          document.getElementById('editNotes') as HTMLTextAreaElement
        ).value;

        if (!date || !time) {
          Swal.showValidationMessage(
            'Por favor complete todos los campos obligatorios'
          );
          return false;
        }

        return {
          date: date,
          time: time,
          status: status,
          priority: priority,
          reason: reason.trim(),
          notes: notes.trim(),
        };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const updatedData = {
          ...appointment,
          date: result.value.date,
          time: result.value.time,
          status: result.value.status,
          priority: result.value.priority,
          reason: result.value.reason,
          notes: result.value.notes,
        };

        this.appointmentsService
          .updateAppointment(appointment.id, updatedData)
          .subscribe({
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'La cita ha sido actualizada correctamente',
                confirmButtonColor: '#3085d6',
              });
              this.loadAppointmentsByPhysician();
            },
            error: (error: any) => {
              console.error('Error al actualizar la cita:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la cita. Por favor intente nuevamente.',
                confirmButtonColor: '#3085d6',
              });
            },
          });
      }
    });
  }
}
