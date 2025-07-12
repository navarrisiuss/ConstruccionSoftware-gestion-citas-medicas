import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { 
  Chart, 
  ChartConfiguration, 
  registerables,
  TooltipItem,
  ChartType
} from 'chart.js';
import { AdminService } from '../../../services/admin.service';
import { PhysicianService } from '../../../services/physician.service';
import Swal from 'sweetalert2';

Chart.register(...registerables);

interface ReportFilters {
  reportType: string;
  startDate: string;
  endDate: string;
  physicianId: string;
  specialty: string;
  status: string;
}

interface PhysicianDto {
  id: number;
  fullName: string;
  specialty: string;
}

@Component({
  selector: 'app-generate-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-report.component.html',
  styleUrls: ['./generate-report.component.css']
})
export class GenerateReportComponent implements OnInit {
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef;

  // FILTROS DE REPORTE
  filters: ReportFilters = {
    reportType: 'appointments',
    startDate: '',
    endDate: '',
    physicianId: '',
    specialty: '',
    status: ''
  };

  // DATOS
  reportData: any = null;
  physicians: PhysicianDto[] = [];
  specialties: string[] = [
    'Cardiología', 'Dermatología', 'Endocrinología', 'Gastroenterología',
    'Ginecología', 'Neurología', 'Oftalmología', 'Ortopedia', 'Pediatría',
    'Psiquiatría', 'Radiología', 'Urología', 'Medicina General',
    'Traumatología', 'Oncología', 'Otorrinolaringología'
  ];
  
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'scheduled', label: 'Programadas' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'completed', label: 'Completadas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'no_show', label: 'No asistieron' }
  ];

  // ESTADO
  isLoading = false;
  chart: Chart | null = null;
  reportHistory: any[] = [];
  generalStatistics: any = null;

  constructor(
    private adminService: AdminService,
    private physicianService: PhysicianService,
    private router: Router
  ) {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.filters.endDate = today.toISOString().split('T')[0];
    this.filters.startDate = lastMonth.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.loadPhysicians();
    this.loadReportHistory();
    this.loadGeneralStatistics();
  }

  // CARGAR MÉDICOS
  loadPhysicians() {
    this.physicianService.getAllPhysicians().subscribe({
      next: (physicians: any[]) => {
        this.physicians = physicians.map(p => ({
          id: p.id,
          fullName: `${p.name} ${p.paternalLastName} ${p.maternalLastName}`,
          specialty: p.specialty
        }));
      },
      error: (error) => {
        console.error('Error cargando médicos:', error);
      }
    });
  }

  // CORREGIR: Método para parsear JSON
  parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return {};
    }
  }

  // CARGAR HISTORIAL DE REPORTES
  loadReportHistory() {
    this.adminService.getReportHistory().subscribe({
      next: (history) => {
        this.reportHistory = history;
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
      }
    });
  }

  // CARGAR ESTADÍSTICAS GENERALES
  loadGeneralStatistics() {
    this.adminService.getGeneralStatistics().subscribe({
      next: (stats) => {
        this.generalStatistics = stats;
        setTimeout(() => {
          this.createStatusChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error cargando estadísticas:', error);
      }
    });
  }

  // GENERAR REPORTE
  generateReport() {
    if (!this.validateFilters()) {
      return;
    }
  
    this.isLoading = true;
  
    let reportObservable;
    
    switch (this.filters.reportType) {
      case 'appointments':
        reportObservable = this.adminService.generateAppointmentsReport(this.filters);
        break;
      case 'physicians':
        reportObservable = this.adminService.generatePhysiciansReport(this.filters);
        break;
      case 'patients':
        reportObservable = this.adminService.generatePatientsReport(this.filters);
        break;
      default:
        this.isLoading = false;
        Swal.fire('Error', 'Tipo de reporte no válido', 'error');
        return;
    }
  
    reportObservable.subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
        
        setTimeout(() => {
          this.createReportChart();
        }, 100);
  
        //  MEJORAR el mensaje de éxito
        Swal.fire({
          title: '🎉 Reporte Generado',
          html: `
            <div style="text-align: center; padding: 10px;">
              <div style="font-size: 48px; margin-bottom: 15px;">📊</div>
              <p style="font-size: 16px; color: #555; margin-bottom: 15px;">
                Se encontraron <strong>${data.reportInfo.totalRecords}</strong> registros
              </p>
              <div style="background: #d4edda; padding: 10px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #28a745;">
                <p style="margin: 5px 0; color: #155724;">
                   Datos cargados correctamente
                </p>
                <p style="margin: 5px 0; color: #155724;">
                  📈 Gráficos generados
                </p>
                <p style="margin: 5px 0; color: #155724;">
                  📄 Listo para exportar
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonText: '👀 Ver Reporte',
          confirmButtonColor: '#28a745',
          allowOutsideClick: true
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error generando reporte:', error);
        Swal.fire({
          title: '❌ Error al Generar Reporte',
          text: 'No se pudo generar el reporte. Por favor, verifica los filtros e inténtalo de nuevo.',
          icon: 'error',
          confirmButtonText: 'Reintentar',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // VALIDAR FILTROS
  validateFilters(): boolean {
    if (!this.filters.reportType) {
      Swal.fire('Error', 'Seleccione un tipo de reporte', 'warning');
      return false;
    }

    if (this.filters.reportType === 'appointments' && (!this.filters.startDate || !this.filters.endDate)) {
      Swal.fire('Error', 'Para reportes de citas debe especificar un rango de fechas', 'warning');
      return false;
    }

    if (this.filters.startDate && this.filters.endDate && this.filters.startDate > this.filters.endDate) {
      Swal.fire('Error', 'La fecha de inicio debe ser anterior a la fecha de fin', 'warning');
      return false;
    }

    return true;
  }

  // CORREGIR: Crear gráfico de estado general con tipos correctos
  createStatusChart() {
    if (!this.generalStatistics?.appointmentStatusDistribution || !this.chartCanvas) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const data = this.generalStatistics.appointmentStatusDistribution;

    const statusLabels: Record<string, string> = {
      'scheduled': 'Programadas',
      'confirmed': 'Confirmadas', 
      'completed': 'Completadas',
      'cancelled': 'Canceladas',
      'no_show': 'No Asistieron'
    };

    const statusColors: Record<string, string> = {
      'scheduled': '#17a2b8',
      'confirmed': '#007bff',
      'completed': '#28a745',
      'cancelled': '#dc3545',
      'no_show': '#ffc107'
    };

    // CONFIGURACIÓN CORREGIDA DEL GRÁFICO DE TORTA
    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: data.map((item: any) => statusLabels[item.status] || item.status),
        datasets: [{
          data: data.map((item: any) => item.count),
          backgroundColor: data.map((item: any) => statusColors[item.status] || '#6c757d'),
          borderWidth: 3,
          borderColor: '#fff',
          hoverBorderWidth: 5,
          hoverBorderColor: '#333'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución Total de Citas por Estado',
            font: {
              size: 18,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                //weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              // CORREGIR: Tipos correctos para los callbacks
              label: function(context: TooltipItem<'pie'>) {
                const dataset = context.dataset;
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} citas (${percentage}%)`;
              },
              afterLabel: function(context: TooltipItem<'pie'>) {
                const dataset = context.dataset;
                const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
                return `Total general: ${total} citas`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000
        },
        elements: {
          arc: {
            borderWidth: 3
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  // CREAR GRÁFICO ESPECÍFICO DEL REPORTE
  createReportChart() {
    if (!this.reportData?.statistics || !this.chartCanvas) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    if (this.filters.reportType === 'appointments' && this.reportData.statistics.statusDistribution) {
      this.createStatusChart();
    } else if (this.filters.reportType === 'physicians' && this.reportData.statistics.specialtyDistribution) {
      this.createSpecialtyChart();
    }
  }

  // CREAR GRÁFICO POR ESPECIALIDAD
  createSpecialtyChart() {
    if (!this.reportData?.statistics?.specialtyDistribution || !this.chartCanvas) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    const data = this.reportData.statistics.specialtyDistribution;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.map((item: any) => item.specialty),
        datasets: [{
          label: 'Médicos por Especialidad',
          data: data.map((item: any) => item.physician_count),
          backgroundColor: [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
            '#d299c2', '#fef9d7', '#667eea', '#764ba2'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Médicos por Especialidad',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'right',
            labels: { padding: 15, usePointStyle: true }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  exportToPDF() {
    if (!this.reportData) {
      Swal.fire('Error', 'No hay datos para exportar', 'warning');
      return;
    }
  
    this.isLoading = true;
  
    //  CAPTURAR PRIMERO EL GRÁFICO COMO IMAGEN
    let chartImageData: string | null = null;
    
    if (this.chart && this.chartCanvas) {
      try {
        chartImageData = this.chart.toBase64Image('image/png', 1.0);
      } catch (error) {
        console.warn('No se pudo capturar el gráfico:', error);
      }
    }
  
    // Capturar el contenido PDF
    const element = this.pdfContent.nativeElement;
  
    html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      ignoreElements: (element) => {
        return element.classList.contains('no-print') || 
               element.classList.contains('export-buttons') ||
               element.classList.contains('report-history') ||
               element.classList.contains('filters-section');
      }
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      //  AGREGAR PORTADA CON GRÁFICO
      pdf.setFillColor(102, 126, 234);
      pdf.rect(0, 0, 210, 50, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Reporte de ${this.getReportTypeLabel()}`, 105, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 105, 40, { align: 'center' });
      
      //  AGREGAR GRÁFICO EN LA PORTADA SI EXISTE
      if (chartImageData) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.text('Estadísticas Generales', 105, 65, { align: 'center' });
        
        // Agregar gráfico centrado
        const chartWidth = 300;
        const chartHeight = 200;
        const chartX = (210 - chartWidth) / 2;
        const chartY = 75;
        
        pdf.addImage(chartImageData, 'PNG', chartX, chartY, chartWidth, chartHeight);
        
        // Agregar resumen de estadísticas
        let yPos = 170;
        pdf.setFontSize(12);
        
        if (this.reportData.statistics?.statusDistribution) {
          pdf.text('Distribución por Estado:', 20, yPos);
          yPos += 8;
          
          this.reportData.statistics.statusDistribution.forEach((stat: any) => {
            pdf.setFontSize(10);
            pdf.text(`• ${this.getStatusLabel(stat.status)}: ${stat.count} (${stat.percentage}%)`, 25, yPos);
            yPos += 6;
          });
        }
        
        pdf.addPage();
      }
      
      //  AGREGAR CONTENIDO PRINCIPAL
      pdf.setTextColor(0, 0, 0);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight() - 20;
      
      if (pdfHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      } else {
        let position = 0;
        let remainingHeight = pdfHeight;
        
        while (remainingHeight > 0) {
          const currentPageHeight = Math.min(pageHeight, remainingHeight);
          
          if (position > 0) {
            pdf.addPage();
          }
          
          pdf.addImage(imgData, 'PNG', 10, 10 - position, pdfWidth, pdfHeight);
          
          position += currentPageHeight;
          remainingHeight -= currentPageHeight;
        }
      }
      
      const fileName = this.generateFileName('pdf');
      pdf.save(fileName);
      
      this.isLoading = false;
      this.saveReportToServer(fileName);
      
      Swal.fire({
        title: ' PDF Completo Generado',
        text: `El archivo ${fileName} incluye gráficos y datos completos`,
        icon: 'success',
        timer: 3000
      });
      
    }).catch((error) => {
      console.error('Error generando PDF:', error);
      this.isLoading = false;
      Swal.fire('Error', 'No se pudo generar el PDF', 'error');
    });
  }

  exportTableToPDF() {
    if (!this.reportData) {
      Swal.fire('Error', 'No hay datos para exportar', 'warning');
      return;
    }
  
    this.isLoading = true;
  
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para más espacio
  
    //  CABECERA MEJORADA
    doc.setFillColor(102, 126, 234);
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte de ${this.getReportTypeLabel()}`, 148, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 148, 30, { align: 'center' });
    
    if (this.filters.startDate && this.filters.endDate) {
      doc.text(`Período: ${this.filters.startDate} - ${this.filters.endDate}`, 148, 37, { align: 'center' });
    }
  
    doc.setTextColor(0, 0, 0);
    let startY = 30;
  
    //  AGREGAR GRÁFICO SI EXISTE
    if (this.chart && this.chartCanvas) {
      try {
        const chartImageData = this.chart.toBase64Image('image/png', 1.0);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Gráfico de Distribución', 20, startY+20);
        
        // Agregar gráfico en landscape
        const chartWidth = 250;
        const chartHeight = 150;
        const chartX = 20;
        const chartY = startY + 10;
        
        doc.addImage(chartImageData, 'PNG', chartX, chartY, chartWidth, chartHeight);
        
        //  AGREGAR ESTADÍSTICAS AL LADO DEL GRÁFICO
        let statsX = chartX + 20;
        let statsY = chartY + 30;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen Estadístico:', statsX, statsY);
        
        if (this.reportData.statistics?.statusDistribution) {
          statsY += 10;
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          this.reportData.statistics.statusDistribution.forEach((stat: any) => {
            doc.text(`• ${this.getStatusLabel(stat.status)}: ${stat.count} (${stat.percentage}%)`, statsX, statsY);
            statsY += 6;
          });
        }
        
        startY = chartY + chartHeight + 20;
        
      } catch (error) {
        console.warn('No se pudo agregar el gráfico al PDF:', error);
        startY += 10;
      }
    }
  
    // Preparar datos para la tabla
    let headers: string[] = [];
    let rows: string[][] = [];
  
    if (this.filters.reportType === 'appointments') {
      headers = ['Fecha', 'Hora', 'Paciente', 'Médico', 'Especialidad', 'Estado', 'Prioridad'];
      rows = this.reportData.appointments.map((apt: any) => [
        apt.date,
        apt.time,
        apt.patient_name || 'N/A',
        apt.physician_name || 'N/A',
        apt.physician_specialty || 'N/A',
        this.getStatusLabel(apt.status),
        apt.priority || 'Normal'
      ]);
    } else if (this.filters.reportType === 'physicians') {
      headers = ['Nombre', 'Especialidad', 'Email','Total Citas', 'Completadas'];
      rows = this.reportData.physicians.map((phy: any) => [
        `${phy.name} ${phy.paternalLastName}`.substring(0, 25),
        phy.specialty,
        phy.email.substring(0, 25),
        phy.phone || 'N/A',
        phy.total_appointments.toString(),
        phy.completed_appointments.toString()
      ]);
    } else if (this.filters.reportType === 'patients') {
      headers = ['Nombre', 'RUT', 'Email', 'Teléfono', 'Género', 'Total Citas', 'Última Cita'];
      rows = this.reportData.patients.map((pat: any) => [
        `${pat.name} ${pat.paternalLastName}`.substring(0, 25),
        pat.rut,
        pat.email.substring(0, 25),
        pat.phone || 'N/A',
        pat.gender || 'N/A',
        pat.total_appointments.toString(),
        pat.last_appointment_date || 'N/A'
      ]);
    }
  
    //TABLA CON GRÁFICO
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: startY,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      tableWidth: 'auto',
      margin: { left: 14, right: 14 }
    });
  
    // PIE DE PÁGINA
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Página ${i} de ${pageCount}`, 148, 200, { align: 'center' });
      doc.text(`Total: ${this.reportData.reportInfo.totalRecords} registros`, 270, 200, { align: 'right' });
    }
  
    this.isLoading = false;
  
    const fileName = this.generateFileName('pdf');
    doc.save(fileName);
  
    this.saveReportToServer(fileName);
    
    Swal.fire({
      title: ' Tabla con Gráficos Exportada',
      text: `El archivo ${fileName} incluye tabla y gráficos estadísticos`,
      icon: 'success',
      timer: 3000
    });
  }

  // GUARDAR REPORTE EN EL SERVIDOR
  saveReportToServer(fileName: string) {
    if (!this.reportData) return;
  
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const saveData = {
      reportType: this.filters.reportType,
      reportData: this.reportData,
      fileName: fileName,
      generatedBy: currentUser.name || 'admin'
    };
  
    this.adminService.saveReport(saveData).subscribe({
      next: (response) => {
        console.log('Reporte guardado en servidor:', response);
        this.loadReportHistory();
        
        //  TOAST NOTIFICATION MÁS DISCRETA (OPCIONAL)
        Swal.fire({
          title: '💾 Guardado Automático',
          html: `
            <div style="text-align: left; font-size: 14px;">
              <p style="margin: 8px 0;">
                📄 <strong>Archivo:</strong> ${response.fileName}
              </p>
              <p style="margin: 8px 0;">
                📊 <strong>Registros:</strong> ${this.reportData.reportInfo.totalRecords}
              </p>
              <p style="margin: 8px 0;">
                🕐 <strong>Guardado:</strong> ${new Date().toLocaleString('es-ES')}
              </p>
            </div>
          `,
          icon: 'info',
          position: 'top-end',
          toast: true,
          timer: 5000, // 5 segundos para el toast
          timerProgressBar: true,
          showConfirmButton: false,
          showCloseButton: true //  Botón X para cerrar
        });
      },
      error: (error) => {
        console.error('Error guardando reporte en servidor:', error);
        Swal.fire({
          title: '⚠️ Advertencia',
          text: 'El reporte se descargó correctamente, pero no se pudo guardar en el servidor.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ffc107'
        });
      }
    });
  }

  // MÉTODOS AUXILIARES
  generateFileName(extension: string): string {
    const reportType = this.getReportTypeLabel();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${reportType}_${timestamp}.${extension}`;
  }

  getReportTypeLabel(): string {
    const labels: Record<string, string> = {
      'appointments': 'Citas',
      'physicians': 'Médicos', 
      'patients': 'Pacientes'
    };
    return labels[this.filters.reportType] || 'Reporte';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'scheduled': 'Programada',
      'confirmed': 'Confirmada',
      'completed': 'Completada',
      'cancelled': 'Cancelada',
      'no_show': 'No Asistió'
    };
    return labels[status] || status;
  }
  
  // AGREGAR: Método alternativo con confirmación si hay datos sin guardar
  backToAdminDashboardWithConfirmation() {
    if (this.reportData && !this.isReportSaved()) {
      Swal.fire({
        title: '⚠️ ¿Estás seguro?',
        text: 'Tienes un reporte generado. ¿Deseas volver al dashboard sin guardarlo?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, volver',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/admin-dashboard']);
        }
      });
    } else {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  // MÉTODO AUXILIAR: Verificar si el reporte fue guardado
  private isReportSaved(): boolean {
    // Puedes implementar lógica para verificar si el reporte actual está en el historial
    return this.reportHistory.some(report => 
      report.generated_at && 
      new Date(report.generated_at).getTime() > (Date.now() - 60000) // Último minuto
    );
  }
  

  // LIMPIAR FILTROS
  clearFilters() {
    this.filters = {
      reportType: 'appointments',
      startDate: '',
      endDate: '',
      physicianId: '',
      specialty: '',
      status: ''
    };
    this.reportData = null;
    
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Restablecer fechas por defecto
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    this.filters.endDate = today.toISOString().split('T')[0];
    this.filters.startDate = lastMonth.toISOString().split('T')[0];
  }
}