import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import {PhysicianService} from '../../../../services/physician.service';
import { Router } from '@angular/router';
import {MEDICAL_SPECIALTIES} from '../../../../constants/medical-specialties';
import Swal from 'sweetalert2';

interface PhysicianDto {
  id: number;
  fullName: string;
  specialty: string; // ✅ Agregar especialidad
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
  status?: string;
  isCurrentPatient: boolean;
}

@Component({
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  newAppt = { patient_id: '', physician_id: '', date: '', time: '', specialty: ''};
  physicians: PhysicianDto[] = [];
  allPhysicians: PhysicianDto[] = []; // ✅ Lista completa de médicos
  filteredPhysicians: PhysicianDto[] = []; // ✅ Médicos filtrados por especialidad
  specialtyCounts: SpecialtyCount[] = []; // ✅ Conteo por especialidad
  appointments: AppointmentEvent[] = [];
  patientId = '';
  currentUser: any = null;

  // Lista de especialidades médicas
  medicalSpecialties = MEDICAL_SPECIALTIES;

  // Calendario simple
  currentDate = new Date();
  calendarDays: any[] = [];

  constructor(
    private adminSvc: AdminService,
    private authService: AuthService,
    private physicianService: PhysicianService,
    private router: Router
  ) {}

  ngOnInit() {
    // ✅ Obtener usuario autenticado
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser && this.currentUser.id) {
      this.patientId = this.currentUser.id.toString();
      this.newAppt.patient_id = this.patientId;

      // Solo cargar datos si tenemos un paciente válido
      this.loadPhysicians();
      this.loadAppointments();
      this.generateCalendar();
    } else {
      // Si no hay usuario autenticado, redirigir al login
      Swal.fire({
        title: 'Sesión Expirada',
        text: 'Debe iniciar sesión para agendar citas',
        icon: 'warning',
        confirmButtonText: 'Ir a Login'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  private loadPhysicians() {
    // ✅ Cargar médicos con especialidades
    this.physicianService.getAllPhysicians()
      .subscribe({
        next: (list: any[]) => {
          console.log('Médicos desde el servidor:', list);

          this.allPhysicians = list.map(p => ({
            id: p.id,
            fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
            specialty: p.specialty
          }));

          this.physicians = [...this.allPhysicians];
          this.calculateSpecialtyCounts();

          console.log('Médicos procesados:', this.allPhysicians);
          console.log('Conteos por especialidad:', this.specialtyCounts);
        },
        error: (error) => {
          console.error('Error cargando médicos:', error);
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

  // ✅ Obtener conteo de médicos para una especialidad
  getPhysicianCount(specialty: string): number {
    const specialtyCount = this.specialtyCounts.find(sc => sc.specialty === specialty);
    return specialtyCount ? specialtyCount.count : 0;
  }

  // ✅ Filtrar médicos cuando se selecciona una especialidad
  onSpecialtyChange() {
    console.log('Especialidad seleccionada:', this.newAppt.specialty);

    if (this.newAppt.specialty) {
      this.filteredPhysicians = this.allPhysicians.filter(p =>
        p.specialty === this.newAppt.specialty
      );
      console.log('Médicos filtrados:', this.filteredPhysicians);
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
  }

  loadPhysiciansBySpecialty(specialty: string) {

  }

  loadAppointments() {
    // Cargar TODAS las citas, no solo las del paciente actual
    this.adminSvc.getAllAppointments()
      .subscribe({
        next: (list: any[]) => {
          console.log('Todas las citas desde el servidor:', list);

          this.appointments = list.map(a => {
            console.log('Cita original:', a);

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
              status: a.status,
              isCurrentPatient: a.patient_id.toString() === this.patientId // ✅ Comparar con ID real
            };

            console.log('Cita mapeada:', mappedAppointment);
            console.log('¿Es del paciente actual?', mappedAppointment.isCurrentPatient);
            return mappedAppointment;
          });

          this.generateCalendar();
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
        }
      });
  }

  // ✅ Agregar método para mostrar información del paciente en el header
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

      const dayAppointments = this.appointments.filter(apt => {
        console.log(`Comparando: "${apt.date}" === "${dateString}"`);
        return apt.date === dateString;
      });

      // ✅ Ordenar citas por hora
      const sortedAppointments = dayAppointments.sort((a, b) => {
        return a.time.localeCompare(b.time);
      });

      // ✅ Mostrar solo las primeras 2 citas
      const visibleAppointments = sortedAppointments.slice(0, 2);
      const hasMoreAppointments = sortedAppointments.length > 2;

      // Identificar si hay citas mixtas (propias y de otros)
      const hasOwnAppointments = sortedAppointments.some(apt => apt.isCurrentPatient);
      const hasOtherAppointments = sortedAppointments.some(apt => !apt.isCurrentPatient);
      const isMixedDay = hasOwnAppointments && hasOtherAppointments;

      if (sortedAppointments.length > 0) {
        console.log(`✅ Día ${day} (${dateString}): ${sortedAppointments.length} citas, mostrando ${visibleAppointments.length}`);
      }

      this.calendarDays.push({
        day: day,
        isOtherMonth: false,
        dateString: dateString,
        appointments: visibleAppointments, // ✅ Solo las primeras 2
        allAppointments: sortedAppointments,
        hasMoreAppointments: hasMoreAppointments,
        totalAppointments: sortedAppointments.length,
        isToday: this.isToday(year, month, day),
        isMixedDay: isMixedDay,
        hasOwnAppointments: hasOwnAppointments,
        hasOtherAppointments: hasOtherAppointments
      });
    }
  }

  // ✅ Mostrar ventana emergente con todas las citas del día
  showDayDetails(calDay: any) {
    if (!calDay.allAppointments || calDay.allAppointments.length === 0) {
      return;
    }

    const appointmentsHtml = calDay.allAppointments.map((apt: any, index: number) => {
      const appointmentClass = apt.isCurrentPatient ? 'current-patient' : 'other-patient';
      const statusText = apt.status === 'cancelled' ? ' (Cancelada)' :
                        apt.status === 'completed' ? ' (Completada)' : '';

      return `
        <div class="modal-appointment-item ${appointmentClass}" style="
          background: ${apt.isCurrentPatient ? '#17a2b8' : '#6c757d'};
          color: white;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border-radius: 6px;
          border-left: 4px solid ${apt.isCurrentPatient ? '#0d6efd' : '#ffc107'};
        ">
          <div style="font-weight: bold; font-size: 1rem;">
            🕐 ${apt.time}
          </div>
          <div style="margin-top: 0.25rem;">
            👨‍⚕️ Dr. ${apt.physician}
          </div>
          <div style="margin-top: 0.25rem; font-size: 0.9rem;">
            ${apt.isCurrentPatient ?
              '👤 Mi Cita' :
              `👤 ${apt.patient} (Ocupado)`
            }${statusText}
          </div>
        </div>
      `;
    }).join('');

    const dateFormatted = new Date(calDay.dateString + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

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
      width: '500px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#17a2b8',
      customClass: {
        container: 'day-details-modal'
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

  submit() {
    if (!this.newAppt.physician_id || !this.newAppt.date || !this.newAppt.time) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor complete todos los campos',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // ✅ Verificar que tenemos ID de paciente válido
    if (!this.patientId) {
      Swal.fire({
        title: 'Error de Sesión',
        text: 'No se pudo identificar al paciente. Inicie sesión nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Validación adicional: no permitir fechas pasadas
    const selectedDate = new Date(this.newAppt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      Swal.fire({
        title: 'Error',
        text: 'No puede agendar citas en fechas pasadas',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // ✅ Asegurar que el patient_id esté actualizado
    this.newAppt.patient_id = this.patientId;

    console.log('Enviando cita:', this.newAppt);
    console.log('ID del paciente en la cita:', this.newAppt.patient_id);

    this.adminSvc.createAppointment(this.newAppt)
      .subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);
          console.log('Recargando citas...');
          this.loadAppointments();
          this.newAppt = { patient_id: this.patientId, physician_id: '', date: '', time: '', specialty: ''};
          Swal.fire({
            title: '¡Cita creada con éxito!',
            text: 'Su cita ha sido agendada correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        },
        error: (error) => {
          console.error('Error al crear cita:', error);

          // Manejar específicamente el error de conflicto
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

  goToPatientDashboard() {
    this.router.navigate(['/patient-dashboard']);
  }
}
