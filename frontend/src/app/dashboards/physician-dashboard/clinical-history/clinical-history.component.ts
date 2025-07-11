import {Component, OnInit} from '@angular/core';
import {AppointmentsService} from '../../../services/appointments.service';
import {AuthService} from '../../../services/auth.service';
import {PatientService} from '../../../services/patient.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-clinical-history',
  templateUrl: './clinical-history.component.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./clinical-history.component.css']
})
export class ClinicalHistoryComponent implements OnInit {
  appointments: any[] = [];
  physicianId!: number;

  constructor(
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private patientService: PatientService
  ) {
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.physicianId = currentUser.id;
      this.loadAppointmentsByPhysician();
    } else {
      console.error('No se encontró el médico logueado');
    }
  }

  loadAppointmentsByPhysician(): void {
    this.appointmentsService.getAppointmentsByPhysician(this.physicianId).subscribe({
      next: (data) => {
        // Procesamos cada cita individualmente
        const formattedAppointments = data.map((appointment: any) => {
          return {
            ...appointment,
            date: this.formatDate(appointment.date),
            time: this.formatTime(appointment.time),
            patientFullName: '' // lo llenaremos luego
          };
        });

        this.appointments = formattedAppointments;

        // Ahora por cada cita, hacemos una solicitud para obtener los datos del paciente
        this.appointments.forEach((appointment, index) => {
          this.patientService.getPatientById(appointment.patient_id).subscribe({
            next: (patientData) => {
              const fullName = `${patientData.name} ${patientData.paternalLastName} ${patientData.maternalLastName}`;
              this.appointments[index].patientFullName = fullName;
            },
            error: (error) => {
              console.error(`Error al obtener paciente con ID ${appointment.patient_id}:`, error);
              this.appointments[index].patientFullName = 'Paciente no encontrado';
            }
          });
        });
      },
      error: (error) => {
        console.error('Error al obtener citas:', error);
      }
    });
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Enero = 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
}


