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
  specialty: undefined
  physicians: PhysicianDto[] = [];
  appointments: AppointmentEvent[] = [];
  patientId = ''; // ✅ Cambiar a string vacío inicialmente
  currentUser: any = null; // ✅ Agregar variable para usuario actual

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
    this.adminSvc.getPhysiciansForSelect()
      .subscribe((list: {id:number; fullName:string}[]) => this.physicians = list);
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

      // Identificar si hay citas mixtas (propias y de otros)
      const hasOwnAppointments = dayAppointments.some(apt => apt.isCurrentPatient);
      const hasOtherAppointments = dayAppointments.some(apt => !apt.isCurrentPatient);
      const isMixedDay = hasOwnAppointments && hasOtherAppointments;

      if (dayAppointments.length > 0) {
        console.log(`✅ Día ${day} (${dateString}): encontradas ${dayAppointments.length} citas`, dayAppointments);
      }

      this.calendarDays.push({
        day: day,
        isOtherMonth: false,
        dateString: dateString,
        appointments: dayAppointments,
        isToday: this.isToday(year, month, day),
        isMixedDay: isMixedDay,
        hasOwnAppointments: hasOwnAppointments,
        hasOtherAppointments: hasOtherAppointments
      });
    }

    const daysWithAppointments = this.calendarDays.filter(d => d.appointments?.length > 0);
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
