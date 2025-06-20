import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../services/admin.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface PhysicianDto {
  id: number;
  fullName: string;
}

interface AppointmentEvent {
  date: string;
  time: string;
  physician: string;
}

@Component({
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.css']
})
export class AppointmentFormComponent implements OnInit {
  newAppt = { patient_id: '', physician_id: '', date: '', time: '' };
  physicians: PhysicianDto[] = [];
  appointments: AppointmentEvent[] = [];
  patientId = '1';
  
  // Calendario simple
  currentDate = new Date();
  calendarDays: any[] = [];

  constructor(
    private adminSvc: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.newAppt.patient_id = this.patientId;
    this.loadPhysicians();
    this.loadAppointments();
    this.generateCalendar();
  }

  private loadPhysicians() {
    this.adminSvc.getPhysiciansForSelect()
      .subscribe((list: {id:number; fullName:string}[]) => this.physicians = list);
  }

  loadAppointments() {
    this.adminSvc.getAllAppointments()
      .subscribe((list: any[]) => {
        this.appointments = list
          .filter(a => a.patient_id == this.patientId)
          .map(a => ({
            date: a.date,
            time: a.time,
            physician: a.physician_name
          }));
        this.generateCalendar();
        console.log('Citas cargadas:', this.appointments); // Para debug
      });
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
      const dayAppointments = this.appointments.filter(apt => apt.date === dateString);
      
     // Debug para ver si encuentra citas
     if (dayAppointments.length > 0) {
       console.log(`Día ${day}: encontradas ${dayAppointments.length} citas`, dayAppointments);
     }
      
      this.calendarDays.push({
        day: day,
        isOtherMonth: false,
        dateString: dateString,
        appointments: dayAppointments,
        isToday: this.isToday(year, month, day)
      });
    }
    console.log('Calendario generado:', this.calendarDays.filter(d => d.appointments?.length > 0));
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
    console.log('Enviando cita:', this.newAppt); // Debug
    this.adminSvc.createAppointment(this.newAppt)
      .subscribe(() => {
        this.loadAppointments();
        // Limpiar formulario
        this.newAppt = { patient_id: this.patientId, physician_id: '', date: '', time: '' };
        //usar swal.fire para mostrar mensaje de éxito
        Swal.fire({
          title: 'Cita creada con éxito',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        })
      });
  }

  goToPatientDashboard() {
    this.router.navigate(['/patient-dashboard']);
  }
}