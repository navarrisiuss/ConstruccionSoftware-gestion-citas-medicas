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

  // ✅ NUEVAS PRUEBAS PARA MÉTODOS FALTANTES

  describe('getPhysiciansForSelect', () => {
    it('should get physicians formatted for select dropdown', () => {
      const mockPhysicians = [
        {
          id: 1,
          name: 'Juan',
          paternalLastName: 'Pérez',
          maternalLastName: 'González',
        },
        {
          id: 2,
          name: 'María',
          paternalLastName: 'López',
          maternalLastName: '',
        },
      ];
      const expectedResult = [
        { id: 1, fullName: 'Juan Pérez González' },
        { id: 2, fullName: 'María López' },
      ];

      service.getPhysiciansForSelect().subscribe((physicians: any) => {
        expect(physicians).toEqual(expectedResult);
      });

      const req = httpMock.expectOne(`${apiUrl}/physicians`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysicians);
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
      req.flush(mockResponse);
    });

    it('should get all assistants', () => {
      const mockAssistants = [
        { id: '1', name: 'Ana García' },
        { id: '2', name: 'Luis Martín' },
      ];

      service.getAllAssistants().subscribe((assistants: any) => {
        expect(assistants.length).toBe(2);
        expect(assistants).toEqual(mockAssistants);
      });

      const req = httpMock.expectOne(`${apiUrl}/assistants`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAssistants);
    });

    it('should update an assistant', () => {
      const assistantData = {
        name: 'Ana Updated',
        email: 'ana.updated@hospital.com',
      };
      const mockResponse = { id: 1, ...assistantData };

      service.updateAssistant(1, assistantData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/assistants/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should get assistant by email', () => {
      const mockAssistant = [
        { id: 1, email: 'ana@hospital.com', name: 'Ana García' },
      ];

      service
        .getAssistantByEmail('ana@hospital.com')
        .subscribe((assistant: any) => {
          expect(assistant).toEqual(mockAssistant);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/assistants/email?email=ana@hospital.com`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAssistant);
    });
  });

  describe('Patient Management', () => {
    it('should get all patients', () => {
      const mockPatients = [
        { id: '1', name: 'Carlos', paternalLastName: 'Ruiz' },
        { id: '2', name: 'Sofia', paternalLastName: 'Vargas' },
      ];

      service.getAllPatients().subscribe((patients: any) => {
        expect(patients.length).toBe(2);
        expect(patients).toEqual(mockPatients);
      });

      const req = httpMock.expectOne(`${apiUrl}/patients`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);
    });

    it('should get patient by email', () => {
      const mockPatient = [
        { id: 1, email: 'carlos@email.com', name: 'Carlos Ruiz' },
      ];

      service
        .getPatientByEmail('carlos@email.com')
        .subscribe((patient: any) => {
          expect(patient).toEqual(mockPatient);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/patients/email?email=carlos@email.com`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);
    });
  });

  describe('Appointment Management', () => {
    it('should get all appointments', () => {
      const mockAppointments = [
        { id: '1', date: '2024-01-15', time: '09:00', patient: 'Carlos Ruiz' },
        { id: '2', date: '2024-01-16', time: '10:00', patient: 'Sofia Vargas' },
      ];

      service.getAllAppointments().subscribe((appointments: any) => {
        expect(appointments.length).toBe(2);
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should get appointments by patient', () => {
      const patientId = '123';
      const mockAppointments = [
        { id: '1', patientId: '123', date: '2024-01-15' },
      ];

      service
        .getAppointmentsByPatient(patientId)
        .subscribe((appointments: any) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/patient/${patientId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should create an appointment', () => {
      const appointmentData = {
        patient_id: 1,
        physician_id: 1,
        date: '2024-01-15',
        time: '09:00',
        reason: 'Consulta general',
      };
      const mockResponse = { id: 1, ...appointmentData };

      service.createAppointment(appointmentData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should update appointment status', () => {
      const appointmentId = 1;
      const status = 'confirmed';
      const mockResponse = { id: appointmentId, status: status };

      service
        .updateAppointmentStatus(appointmentId, status)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}/status`
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ status });
      req.flush(mockResponse);
    });

    it('should update appointment', () => {
      const appointmentId = 1;
      const appointmentData = { date: '2024-01-16', time: '10:00' };
      const mockResponse = { id: appointmentId, ...appointmentData };

      service
        .updateAppointment(appointmentId, appointmentData)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${apiUrl}/appointments/${appointmentId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should update appointment notes', () => {
      const appointmentId = 1;
      const notesData = {
        notes: 'Paciente llegó puntual',
        diagnosis: 'Todo normal',
      };
      const mockResponse = { id: appointmentId, ...notesData };

      service
        .updateAppointmentNotes(appointmentId, notesData)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}/notes`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should delete appointment', () => {
      const appointmentId = 1;
      const mockResponse = { message: 'Appointment deleted successfully' };

      service.deleteAppointment(appointmentId).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments/${appointmentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should cancel appointment', () => {
      const appointmentId = 1;
      const cancelData = {
        reason: 'Patient unavailable',
        cancelled_by: 'admin',
      };
      const mockResponse = {
        id: appointmentId,
        status: 'cancelled',
        ...cancelData,
      };

      service
        .cancelAppointment(appointmentId, cancelData)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/appointments/${appointmentId}/cancel`
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });
  });

  describe('Specialties Management', () => {
    it('should get all specialties for a physician', () => {
      const physicianId = 1;
      const mockSpecialties = ['Cardiología', 'Medicina Interna'];

      service.getAllSpecialties(physicianId).subscribe((specialties: any) => {
        expect(specialties).toEqual(mockSpecialties);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/physicians/${physicianId}/specialties`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockSpecialties);
    });
  });

  describe('Reports Management', () => {
    it('should generate general report', () => {
      const reportType = 'appointments';
      const dateRange = { from: '2024-01-01', to: '2024-01-31' };
      const mockReport = { data: [], summary: { total: 50 } };

      service.generateReport(reportType, dateRange).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ type: reportType, dateRange });
      req.flush(mockReport);
    });

    it('should generate appointments report', () => {
      const filters = { startDate: '2024-01-01', endDate: '2024-01-31' };
      const mockReport = { appointments: [], statistics: {} };

      service.generateAppointmentsReport(filters).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/appointments`);
      expect(req.request.method).toBe('POST');
      req.flush(mockReport);
    });

    it('should generate physicians report', () => {
      const filters = { specialty: 'Cardiología' };
      const mockReport = { physicians: [], statistics: {} };

      service.generatePhysiciansReport(filters).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/physicians`);
      expect(req.request.method).toBe('POST');
      req.flush(mockReport);
    });

    it('should generate patients report', () => {
      const filters = { ageRange: '30-50' };
      const mockReport = { patients: [], statistics: {} };

      service.generatePatientsReport(filters).subscribe((report: any) => {
        expect(report).toEqual(mockReport);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/patients`);
      expect(req.request.method).toBe('POST');
      req.flush(mockReport);
    });

    it('should save report', () => {
      const reportData = {
        type: 'appointments',
        data: [],
        name: 'Monthly Report',
      };
      const mockResponse = { id: 1, saved: true };

      service.saveReport(reportData).subscribe((response: any) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/save`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should get report history', () => {
      const mockHistory = [
        { id: 1, name: 'Report 1', createdAt: '2024-01-01' },
        { id: 2, name: 'Report 2', createdAt: '2024-01-02' },
      ];

      service.getReportHistory().subscribe((history: any) => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get general statistics', () => {
      const mockStatistics = {
        totalAppointments: 150,
        totalPatients: 80,
        totalPhysicians: 12,
      };

      service.getGeneralStatistics().subscribe((stats: any) => {
        expect(stats).toEqual(mockStatistics);
      });

      const req = httpMock.expectOne(`${apiUrl}/reports/statistics`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatistics);
    });
  });

  describe('Medical History', () => {
    it('should get medical history for all patients', () => {
      const mockHistory = [
        { id: 1, patientId: 1, diagnosis: 'Hypertension' },
        { id: 2, patientId: 2, diagnosis: 'Diabetes' },
      ];

      service.getMedicalHistory().subscribe((history: any) => {
        expect(history).toEqual(mockHistory);
      });

      const req = httpMock.expectOne(`${apiUrl}/medical-history`);
      expect(req.request.method).toBe('GET');
      req.flush(mockHistory);
    });

    it('should get medical history for specific patient', () => {
      const patientId = '123';
      const mockHistory = [
        { id: 1, patientId: 123, diagnosis: 'Hypertension' },
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

  describe('Admin and Physician Management', () => {
    it('should update physician', () => {
      const physicianId = 1;
      const physicianData = {
        name: 'Dr. Juan Updated',
        specialty: 'Neurología',
      };
      const mockResponse = { id: physicianId, ...physicianData };

      service
        .updatePhysician(physicianId, physicianData)
        .subscribe((response: any) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${apiUrl}/physicians/${physicianId}`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should get physician by email', () => {
      const email = 'doctor@hospital.com';
      const mockPhysician = [{ id: 1, email: email, name: 'Dr. Juan' }];

      service.getPhysicianByEmail(email).subscribe((physician: any) => {
        expect(physician).toEqual(mockPhysician);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/physicians/email?email=${email}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysician);
    });

    it('should get admin by email', () => {
      const email = 'admin@hospital.com';
      const mockAdmin = [{ id: 1, email: email, name: 'Admin User' }];

      service.getAdminByEmail(email).subscribe((admin: any) => {
        expect(admin).toEqual(mockAdmin);
      });

      const req = httpMock.expectOne(`${apiUrl}/admins/email?email=${email}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAdmin);
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP errors for getAllAppointments', () => {
      service.getAllAppointments().subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      req.flush(
        { message: 'Server Error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });

    it('should handle HTTP errors for createAppointment', () => {
      const appointmentData = { patient_id: 1, physician_id: 1 };

      service.createAppointment(appointmentData).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/appointments`);
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });
});
