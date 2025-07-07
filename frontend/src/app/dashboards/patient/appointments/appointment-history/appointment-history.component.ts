import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AppointmentService } from '../../../../services/appointment.service';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  imports: [NgForOf],
  styleUrl: './appointment-history.component.css'
})
export class AppointmentHistoryComponent implements OnInit {
  currentUser: any = null;
  historialCitas: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.appointmentService.getAppointmentsForLoggedInPatient().subscribe({
      next: (citas) => {
        this.historialCitas = citas.map(cita => ({
          fecha: this.formatearFecha(cita.date),
          hora: this.formatearHora(cita.time),
          medico: `Dr(a). ${cita.physician_name || 'Sin nombre'}`,
          especialidad: cita.specialty || 'General',
          razon: cita.reason || ''
        }));
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
      }
    });
  }

  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const year = fecha.getFullYear();
    return `${dia}/${mes}/${year}`;
  }

  formatearHora(horaStr: string): string {
    // Asumiendo que horaStr es un string tipo "HH:mm:ss" o "HH:mm"
    if (!horaStr) return '';
    const [hora, minutos] = horaStr.split(':');
    return `${hora}:${minutos}`;
  }

  exportarPDF(): void {
    const doc = new jsPDF();

    const pageCount = (doc.internal as any).getNumberOfPages();

    // Título
    doc.setFontSize(18);
    doc.setTextColor('#16648d');
    doc.text('Historial de Citas Médicas', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

    // Agregar espacio después del título
    doc.setFontSize(12);
    doc.setTextColor('#000');
    doc.text(`Paciente: ${this.currentUser?.name} ${this.currentUser?.paternalLastName} ${this.currentUser?.maternalLastName}`, 14, 25);

    // Tabla
    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Hora', 'Médico', 'Especialidad', 'Razón']],
      body: this.historialCitas.map(cita => [
        cita.fecha,
        cita.hora,
        cita.medico,
        cita.especialidad,
        cita.razon
      ]),
      styles: { fontSize: 11, cellPadding: 4, overflow: 'ellipsize' },
      headStyles: { fillColor: '#16a085', halign: 'center', textColor: '#fff', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#f2f2f2' },
      columnStyles: {
        0: { cellWidth: 30 },  // Fecha - ancho un poco mayor
        1: { cellWidth: 20 },  // Hora
        2: { cellWidth: 50 },  // Médico
        3: { cellWidth: 40 },  // Especialidad
        4: { cellWidth: 55 }   // Razón
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageCount = (doc.internal as any).getNumberOfPages();

        doc.setFontSize(10);
        doc.setTextColor('#999');
        doc.text(`Página ${pageCount}`, data.settings.margin.left, pageHeight - 10);
      }
    });


    // Timestamp para nombre de archivo
    const ahora = new Date();
    const timestamp = `${ahora.getFullYear()}${(ahora.getMonth() + 1).toString().padStart(2, '0')}${ahora.getDate().toString().padStart(2, '0')}_${ahora.getHours().toString().padStart(2, '0')}${ahora.getMinutes().toString().padStart(2, '0')}${ahora.getSeconds().toString().padStart(2, '0')}`;

    doc.save(`historial_citas_${this.currentUser?.name}_${this.currentUser?.paternalLastName}_${this.currentUser?.maternalLastName}_${timestamp}.pdf`);
  }
}
