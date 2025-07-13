import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { PhysicianService } from '../../../services/physician.service';
import Swal from 'sweetalert2';
import { Physician } from '../../../models/physician.model';

import { GenerateReportComponent } from './generate-report.component';

describe('GenerateReportComponent', () => {
  let component: GenerateReportComponent;
  let fixture: ComponentFixture<GenerateReportComponent>;
  let adminService: AdminService;
  let physicianService: PhysicianService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateReportComponent, HttpClientTestingModule],
      providers: [AdminService, PhysicianService],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateReportComponent);
    component = fixture.componentInstance;
    adminService = TestBed.inject(AdminService);
    physicianService = TestBed.inject(PhysicianService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load physicians on init', () => {
    const physicians = [
      new Physician(
        'John',
        'Doe',
        'Smith',
        'john.doe@mail.com',
        'password',
        'Cardiology'
      ),
    ];
    spyOn(physicianService, 'getAllPhysicians').and.returnValue(
      of(physicians as any)
    );
    component.ngOnInit();
    expect(component.physicians.length).toBe(1);
    expect(component.physicians[0].fullName).toBe('John Doe Smith');
  });

  it('should handle error when loading physicians', () => {
    spyOn(physicianService, 'getAllPhysicians').and.returnValue(
      throwError(() => new Error('Error'))
    );
    spyOn(console, 'error');
    component.loadPhysicians();
    expect(console.error).toHaveBeenCalledWith(
      'Error cargando médicos:',
      jasmine.any(Error)
    );
  });

  it('should load report history on init', () => {
    const history = [{ id: 1, reportType: 'appointments' }];
    spyOn(adminService, 'getReportHistory').and.returnValue(of(history));
    component.ngOnInit();
    expect(component.reportHistory.length).toBe(1);
  });

  it('should handle error when loading report history', () => {
    spyOn(adminService, 'getReportHistory').and.returnValue(
      throwError(() => new Error('Error'))
    );
    spyOn(console, 'error');
    component.loadReportHistory();
    expect(console.error).toHaveBeenCalledWith(
      'Error cargando historial:',
      jasmine.any(Error)
    );
  });

  it('should load general statistics on init', () => {
    const stats = { totalAppointments: 10 };
    spyOn(adminService, 'getGeneralStatistics').and.returnValue(of(stats));
    spyOn(component, 'createStatusChart');
    component.ngOnInit();
    expect(component.generalStatistics).toEqual(stats);
  });

  it('should handle error when loading general statistics', () => {
    spyOn(adminService, 'getGeneralStatistics').and.returnValue(
      throwError(() => new Error('Error'))
    );
    spyOn(console, 'error');
    component.loadGeneralStatistics();
    expect(console.error).toHaveBeenCalledWith(
      'Error cargando estadísticas:',
      jasmine.any(Error)
    );
  });

  it('should generate appointments report', () => {
    const data = { reportInfo: { totalRecords: 5 }, appointments: [] };
    spyOn(adminService, 'generateAppointmentsReport').and.returnValue(of(data));
    spyOn(Swal, 'fire');
    component.filters.reportType = 'appointments';
    component.generateReport();
    expect(component.reportData).toEqual(data);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should generate physicians report', () => {
    const data = { reportInfo: { totalRecords: 2 }, physicians: [] };
    spyOn(adminService, 'generatePhysiciansReport').and.returnValue(of(data));
    spyOn(Swal, 'fire');
    component.filters.reportType = 'physicians';
    component.generateReport();
    expect(component.reportData).toEqual(data);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should generate patients report', () => {
    const data = { reportInfo: { totalRecords: 10 }, patients: [] };
    spyOn(adminService, 'generatePatientsReport').and.returnValue(of(data));
    spyOn(Swal, 'fire');
    component.filters.reportType = 'patients';
    component.generateReport();
    expect(component.reportData).toEqual(data);
    expect(Swal.fire).toHaveBeenCalled();
  });

  it('should handle error when generating report', () => {
    spyOn(adminService, 'generateAppointmentsReport').and.returnValue(
      throwError(() => new Error('Error'))
    );
    spyOn(Swal, 'fire');
    component.filters.reportType = 'appointments';
    component.generateReport();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'error' })
    );
  });

  it('should validate filters', () => {
    spyOn(Swal, 'fire');
    component.filters.reportType = '';
    expect(component.validateFilters()).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Seleccione un tipo de reporte',
      'warning'
    );

    component.filters.reportType = 'appointments';
    component.filters.startDate = '';
    expect(component.validateFilters()).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'Para reportes de citas debe especificar un rango de fechas',
      'warning'
    );

    component.filters.startDate = '2025-07-13';
    component.filters.endDate = '2025-07-12';
    expect(component.validateFilters()).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(
      'Error',
      'La fecha de inicio debe ser anterior a la fecha de fin',
      'warning'
    );

    component.filters.endDate = '2025-07-14';
    expect(component.validateFilters()).toBe(true);
  });

  it('should clear filters', () => {
    component.filters.reportType = 'patients';
    component.reportData = {};
    component.clearFilters();
    expect(component.filters.reportType).toBe('appointments');
    expect(component.reportData).toBeNull();
  });

  it('should get report type label', () => {
    component.filters.reportType = 'appointments';
    expect(component.getReportTypeLabel()).toBe('Citas');
    component.filters.reportType = 'physicians';
    expect(component.getReportTypeLabel()).toBe('Médicos');
    component.filters.reportType = 'patients';
    expect(component.getReportTypeLabel()).toBe('Pacientes');
    component.filters.reportType = 'unknown';
    expect(component.getReportTypeLabel()).toBe('Reporte');
  });

  it('should get status label', () => {
    expect(component.getStatusLabel('scheduled')).toBe('Programada');
    expect(component.getStatusLabel('confirmed')).toBe('Confirmada');
    expect(component.getStatusLabel('completed')).toBe('Completada');
    expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
    expect(component.getStatusLabel('no_show')).toBe('No Asistió');
    expect(component.getStatusLabel('unknown')).toBe('unknown');
  });

  it('should generate a filename', () => {
    component.filters.reportType = 'appointments';
    const filename = component.generateFileName('pdf');
    expect(filename).toContain('Citas_');
    expect(filename).toContain('.pdf');
  });
});
