import { Component, OnInit } from '@angular/core';
import { AppointmentsService } from '../../../services/appointments.service';
import { PatientService } from '../../../services/patient.service';
import { PhysicianService } from '../../../services/physician.service';
import { DatePipe, NgForOf } from '@angular/common';
import { forkJoin, map, mergeMap, of } from 'rxjs';

@Component({
  selector: 'app-medical-history',
  standalone: true,
  templateUrl: './medical-history.component.html',
  styleUrl: './medical-history.component.css',
  imports: [
    NgForOf
  ],
  providers: [DatePipe]
})
export class MedicalHistoryComponent implements OnInit {
  appointments: any[] = [];

  constructor(
    private appointmentsService: AppointmentsService,
    private patientService: PatientService,
    private physicianService: PhysicianService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.appointmentsService.getAllAppointments()
      .pipe(
        mergeMap(appointments => {
          const detailedAppointments$ = appointments.map(app => {
            const formattedDate = this.datePipe.transform(app.date, 'dd/MM/yyyy');
            const formattedTime = this.formatTime(app.time); // ✅ corregido aquí

            const patient$ = app.patient_id
              ? this.patientService.getPatientById(app.patient_id)
              : of({ name: 'Desconocido' });

            const physician$ = app.physician_id
              ? this.physicianService.getPhysicianById(app.physician_id)
              : of({ name: 'Desconocido' });

            return forkJoin([patient$, physician$]).pipe(
              map(([patient, physician]) => ({
                ...app,
                formattedDate,
                formattedTime,
                patientName: `${patient.name} ${patient.paternalLastName} ${patient.maternalLastName}`,
                physicianName: `${physician.name}`
              }))
            );
          });

          return forkJoin(detailedAppointments$);
        })
      )
      .subscribe({
        next: (detailedAppointments) => {
          this.appointments = detailedAppointments;
        },
        error: (error) => {
          console.error('Error al cargar historial médico:', error);
        }
      });
  }

  // ✅ Nuevo método para formatear hora correctamente
  private formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
}
