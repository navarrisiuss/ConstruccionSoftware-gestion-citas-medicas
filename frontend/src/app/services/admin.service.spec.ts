import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { Admin } from '../models/admin.model';
import { Physician } from '../models/physician.model';
import { Assistant } from '../models/assistant.model';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Physician Management', () => {
    it('should register a physician successfully', () => {
      const mockPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        'Cardiología'
      );
      const mockResponse = { id: '1', ...mockPhysician };

      service.registerPhysician(mockPhysician).subscribe((response: any) => {
        expect(response).toEqual(jasmine.objectContaining(mockResponse));
      });

      const req = httpMock.expectOne(`${apiUrl}/physicians`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPhysician);
      req.flush(mockResponse);
    });

    it('should get all physicians', () => {
      const mockPhysicians = [
        { id: '1', name: 'Dr. Juan', specialty: 'Cardiología' },
        { id: '2', name: 'Dr. María', specialty: 'Neurología' },
      ];

      service.getAllPhysicians().subscribe((physicians: any) => {
        expect(physicians.length).toBe(2);
        expect(physicians).toEqual(mockPhysicians);
      });

      const req = httpMock.expectOne(`${apiUrl}/physicians`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysicians);
    });

    it('should handle physician registration error', () => {
      const mockPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'invalid-email',
        'password123',
        'Cardiología'
      );

      service.registerPhysician(mockPhysician).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/physicians`);
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('Assistant Management', () => {
    it('should register an assistant successfully', () => {
      const mockAssistant = new Assistant(
        'Ana',
        'García',
        'López',
        'ana@hospital.com',
        'password123'
      );
      const mockResponse = { id: '1', ...mockAssistant };

      service.registerAssistant(mockAssistant).subscribe((response: any) => {
        expect(response).toEqual(jasmine.objectContaining(mockResponse));
      });

      const req = httpMock.expectOne(`${apiUrl}/assistants`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAssistant);
      req.flush(mockResponse);
    });

    it('should get all assistants', () => {
      const mockAssistants = [
        { id: '1', name: 'Ana', email: 'ana@hospital.com' },
        { id: '2', name: 'Carlos', email: 'carlos@hospital.com' },
      ];

      service.getAllAssistants().subscribe((assistants: any) => {
        expect(assistants.length).toBe(2);
        expect(assistants).toEqual(mockAssistants);
      });

      const req = httpMock.expectOne(`${apiUrl}/assistants`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAssistants);
    });
  });

  describe('Patient Management', () => {
    it('should get all patients', () => {
      const mockPatients = [
        { id: '1', name: 'Juan', email: 'juan@test.com' },
        { id: '2', name: 'María', email: 'maria@test.com' },
      ];

      service.getAllPatients().subscribe((patients: any) => {
        expect(patients.length).toBe(2);
        expect(patients).toEqual(mockPatients);
      });

      const req = httpMock.expectOne(`${apiUrl}/patients`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);
    });
  });

  describe('Appointment Management', () => {
    it('should get all appointments', () => {
      const mockAppointments = [
        { id: '1', patientId: '1', physicianId: '1', date: '2025-08-15' },
        { id: '2', patientId: '2', physicianId: '2', date: '2025-08-16' },
      ];

      service.getAllAppointments().subscribe((appointments: any) => {
        expect(appointments.length).toBe(2);
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should create an appointment', () => {
      const mockAppointment = {
        patientId: '1',
        physicianId: '1',
        date: '2025-08-15T10:00:00',
      };
      const mockResponse = { id: '1', ...mockAppointment };

      service.createAppointment(mockAppointment).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockAppointment);
      req.flush(mockResponse);
    });

    it('should update an appointment', () => {
      const appointmentId = 1; // Change to number
      const updatedAppointment = {
        patientId: '1',
        physicianId: '1',
        date: '2025-08-16T11:00:00',
      };
      const mockResponse = { id: appointmentId, ...updatedAppointment };

      service
        .updateAppointment(appointmentId, updatedAppointment)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${apiUrl}/appointments/${appointmentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedAppointment);
      req.flush(mockResponse);
    });

    it('should delete an appointment', () => {
      const appointmentId = 1; // Change to number

      service.deleteAppointment(appointmentId).subscribe((response: any) => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments/${appointmentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });
  });

  describe('Reports', () => {
    it('should generate a report without date range', () => {
      const reportType = 'monthly';
      const mockReport = { type: reportType, data: [] };

      service.generateReport(reportType).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        type: reportType,
        dateRange: undefined,
      });
      req.flush(mockReport);
    });

    it('should generate a report with date range', () => {
      const reportType = 'custom';
      const dateRange = { start: '2025-01-01', end: '2025-12-31' };
      const mockReport = { type: reportType, data: [], dateRange };

      service.generateReport(reportType, dateRange).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ type: reportType, dateRange });
      req.flush(mockReport);
    });
  });

  describe('Medical History', () => {
    it('should get all medical history when no patient ID provided', () => {
      const mockHistory = [
        { id: '1', patientId: '1', diagnosis: 'Hypertension' },
        { id: '2', patientId: '2', diagnosis: 'Diabetes' },
      ];

      service.getMedicalHistory().subscribe((history: any) => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(`${apiUrl}/medical-history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get medical history for specific patient', () => {
      const patientId = '1';
      const mockHistory = [
        { id: '1', patientId: '1', diagnosis: 'Hypertension' },
      ];

      service.getMedicalHistory(patientId).subscribe((history: any) => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/medical-history?patientId=${patientId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors', () => {
      service.getAllPhysicians().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/physicians`);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle network errors', () => {
      service.getAllPatients().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(0);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/patients`);
      req.flush(
        { message: 'Network error' },
        { status: 0, statusText: 'Network Error' }
      );
    });
  });
});
