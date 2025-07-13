import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:3000/api/appointments';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AppointmentsService],
    });
    service = TestBed.inject(AppointmentsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAppointmentsByPhysician', () => {
    it('should get appointments by physician ID', () => {
      const physicianId = 1;
      const mockAppointments = [
        {
          id: 1,
          physicianId: 1,
          patientId: 1,
          date: '2023-12-01',
          time: '10:00',
        },
        {
          id: 2,
          physicianId: 1,
          patientId: 2,
          date: '2023-12-01',
          time: '11:00',
        },
      ];

      service
        .getAppointmentsByPhysician(physicianId)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(`${baseUrl}/physician/${physicianId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should handle error when getting appointments by physician', () => {
      const physicianId = 999;

      service.getAppointmentsByPhysician(physicianId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/physician/${physicianId}`);
      req.flush(
        { message: 'Physician not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('getAppointmentsByPatient', () => {
    it('should get appointments by patient ID', () => {
      const patientId = 1;
      const mockAppointments = [
        {
          id: 1,
          physicianId: 1,
          patientId: 1,
          date: '2023-12-01',
          time: '10:00',
        },
      ];

      service.getAppointmentsByPatient(patientId).subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${baseUrl}/patient/${patientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should handle error when getting appointments by patient', () => {
      const patientId = 999;

      service.getAppointmentsByPatient(patientId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/patient/${patientId}`);
      req.flush(
        { message: 'Patient not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('createAppointment', () => {
    it('should create a new appointment', () => {
      const newAppointment = {
        physicianId: 1,
        patientId: 1,
        date: '2023-12-01',
        time: '10:00',
        reason: 'Consulta general',
      };
      const mockResponse = { id: 1, ...newAppointment };

      service.createAppointment(newAppointment).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newAppointment);
      req.flush(mockResponse);
    });

    it('should handle creation error', () => {
      const newAppointment = { physicianId: 1, patientId: 1 };

      service.createAppointment(newAppointment).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('updateAppointment', () => {
    it('should update an appointment', () => {
      const appointmentId = 1;
      const updateData = { date: '2023-12-02', time: '11:00' };
      const mockResponse = { id: 1, ...updateData };

      service
        .updateAppointment(appointmentId, updateData)
        .subscribe((response) => {
          expect(response).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('should handle update error', () => {
      const appointmentId = 999;
      const updateData = { date: '2023-12-02' };

      service.updateAppointment(appointmentId, updateData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      req.flush(
        { message: 'Appointment not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('deleteAppointment', () => {
    it('should delete an appointment', () => {
      const appointmentId = 1;
      const mockResponse = { message: 'Appointment deleted successfully' };

      service.deleteAppointment(appointmentId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle deletion error', () => {
      const appointmentId = 999;

      service.deleteAppointment(appointmentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      req.flush(
        { message: 'Appointment not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('getAppointmentById', () => {
    it('should get appointment by ID', () => {
      const appointmentId = 1;
      const mockAppointment = {
        id: 1,
        physicianId: 1,
        patientId: 1,
        date: '2023-12-01',
      };

      service.getAppointmentById(appointmentId).subscribe((appointment) => {
        expect(appointment).toEqual(mockAppointment);
      });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointment);
    });

    it('should handle appointment not found', () => {
      const appointmentId = 999;

      service.getAppointmentById(appointmentId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/${appointmentId}`);
      req.flush(
        { message: 'Appointment not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('getAppointmentsByDate', () => {
    it('should get appointments by date', () => {
      const date = '2023-12-01';
      const mockAppointments = [
        { id: 1, date: '2023-12-01', time: '10:00' },
        { id: 2, date: '2023-12-01', time: '11:00' },
      ];

      service.getAppointmentsByDate(date).subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${baseUrl}/date/${date}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should return empty array for date with no appointments', () => {
      const date = '2023-12-25';

      service.getAppointmentsByDate(date).subscribe((appointments) => {
        expect(appointments).toEqual([]);
      });

      const req = httpMock.expectOne(`${baseUrl}/date/${date}`);
      req.flush([]);
    });
  });

  describe('getAppointmentsByPhysicianAndDate', () => {
    it('should get appointments by physician and date', () => {
      const physicianId = 1;
      const date = '2023-12-01';
      const mockAppointments = [{ id: 1, physicianId: 1, date: '2023-12-01' }];

      service
        .getAppointmentsByPhysicianAndDate(physicianId, date)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/physician/${physicianId}/date/${date}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPatientAndDate', () => {
    it('should get appointments by patient and date', () => {
      const patientId = 1;
      const date = '2023-12-01';
      const mockAppointments = [{ id: 1, patientId: 1, date: '2023-12-01' }];

      service
        .getAppointmentsByPatientAndDate(patientId, date)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/patient/${patientId}/date/${date}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByStatus', () => {
    it('should get appointments by status', () => {
      const status = 'scheduled';
      const mockAppointments = [
        { id: 1, status: 'scheduled' },
        { id: 2, status: 'scheduled' },
      ];

      service.getAppointmentsByStatus(status).subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
      });

      const req = httpMock.expectOne(`${baseUrl}/status/${status}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPhysicianAndStatus', () => {
    it('should get appointments by physician and status', () => {
      const physicianId = 1;
      const status = 'confirmed';
      const mockAppointments = [{ id: 1, physicianId: 1, status: 'confirmed' }];

      service
        .getAppointmentsByPhysicianAndStatus(physicianId, status)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/physician/${physicianId}/status/${status}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPatientAndStatus', () => {
    it('should get appointments by patient and status', () => {
      const patientId = 1;
      const status = 'completed';
      const mockAppointments = [{ id: 1, patientId: 1, status: 'completed' }];

      service
        .getAppointmentsByPatientAndStatus(patientId, status)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/patient/${patientId}/status/${status}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPhysicianAndPatient', () => {
    it('should get appointments by physician and patient', () => {
      const physicianId = 1;
      const patientId = 1;
      const mockAppointments = [{ id: 1, physicianId: 1, patientId: 1 }];

      service
        .getAppointmentsByPhysicianAndPatient(physicianId, patientId)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/physician/${physicianId}/patient/${patientId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPhysicianPatientAndDate', () => {
    it('should get appointments by physician, patient and date', () => {
      const physicianId = 1;
      const patientId = 1;
      const date = '2023-12-01';
      const mockAppointments = [
        { id: 1, physicianId: 1, patientId: 1, date: '2023-12-01' },
      ];

      service
        .getAppointmentsByPhysicianPatientAndDate(physicianId, patientId, date)
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/physician/${physicianId}/patient/${patientId}/date/${date}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAppointmentsByPhysicianPatientAndStatus', () => {
    it('should get appointments by physician, patient and status', () => {
      const physicianId = 1;
      const patientId = 1;
      const status = 'scheduled';
      const mockAppointments = [
        { id: 1, physicianId: 1, patientId: 1, status: 'scheduled' },
      ];

      service
        .getAppointmentsByPhysicianPatientAndStatus(
          physicianId,
          patientId,
          status
        )
        .subscribe((appointments) => {
          expect(appointments).toEqual(mockAppointments);
        });

      const req = httpMock.expectOne(
        `${baseUrl}/physician/${physicianId}/patient/${patientId}/status/${status}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });
  });

  describe('getAllAppointments', () => {
    it('should get all appointments', () => {
      const mockAppointments = [
        { id: 1, physicianId: 1, patientId: 1, date: '2023-12-01' },
        { id: 2, physicianId: 2, patientId: 2, date: '2023-12-02' },
        { id: 3, physicianId: 1, patientId: 3, date: '2023-12-03' },
      ];

      service.getAllAppointments().subscribe((appointments) => {
        expect(appointments).toEqual(mockAppointments);
        expect(appointments.length).toBe(3);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAppointments);
    });

    it('should return empty array when no appointments exist', () => {
      service.getAllAppointments().subscribe((appointments) => {
        expect(appointments).toEqual([]);
        expect(appointments.length).toBe(0);
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush([]);
    });

    it('should handle server error', () => {
      service.getAllAppointments().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(baseUrl);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});
