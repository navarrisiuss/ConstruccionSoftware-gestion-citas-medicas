import { Component, ElementRef, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-generate-report',
  templateUrl: './generate-report.component.html',
  imports: [
    NgForOf
  ],
  styleUrl: './generate-report.component.css'
})
export class GenerateReportComponent {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  usuarios = [
    { nombre: 'Camilo', edad: 25 },
    { nombre: 'Ana', edad: 30 },
    { nombre: 'Luis', edad: 28 },
  ];

  generatePDF() {
    const element = this.pdfContent.nativeElement;

    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('documento.pdf');
    });
  }

  exportarTablaPDF() {
    const doc = new jsPDF();

    autoTable(doc, {
      head: [['Nombre', 'Edad']],
      body: this.usuarios.map(u => [u.nombre, u.edad.toString()]),
    });

    doc.save('usuarios.pdf');
  }
}