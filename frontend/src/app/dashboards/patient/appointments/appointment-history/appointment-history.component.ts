import {Component} from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {NgForOf} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../../../../services/auth.service';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  imports: [
    NgForOf
  ],
  styleUrl: './appointment-history.component.css'
})
export class AppointmentHistoryComponent {
  currentUser: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
    }
  }

  historialCitas = [
    {fecha: '2025-07-01', hora: '10:00', medico: 'Dra. María Pérez', especialidad: 'Cardiología'},
    {fecha: '2025-06-20', hora: '11:30', medico: 'Dr. Carlos Fernández', especialidad: 'Dermatología'},
    {fecha: '2025-06-15', hora: '09:00', medico: 'Dra. Ana López', especialidad: 'Pediatría'},
    {fecha: '2025-05-30', hora: '14:00', medico: 'Dr. Juan Martínez', especialidad: 'Medicina General'},
    {fecha: '2025-05-10', hora: '16:30', medico: 'Dra. Laura Gómez', especialidad: 'Ginecología'},
    {fecha: '2025-04-25', hora: '08:45', medico: 'Dr. Luis Torres', especialidad: 'Oftalmología'},
    {fecha: '2025-03-20', hora: '13:00', medico: 'Dr. Andrés Sánchez', especialidad: 'Neurología'},
  ];

  exportarPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Fecha de Atención', 'Hora de Atención', 'Médico', 'Especialidad']],
      body: this.historialCitas.map(cita => [cita.fecha, cita.hora, cita.medico, cita.especialidad]),
      styles: {fontSize: 12},
      headStyles: {fillColor: [22, 160, 133]}, // verde suave
      margin: {top: 20},
    });

    doc.save(`historial_citas_${this.currentUser?.name}_${this.currentUser?.paternalLastName}_${this.currentUser?.maternalLastName}.pdf`);
  }
}
