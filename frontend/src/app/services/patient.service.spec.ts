import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient } from '../models/patient.model';
import { Gender } from '../models/gender.enum';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;
  let mockPatient: Patient;
  const apiUrl = 'http://localhost:3000/api/patients';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService],
    });
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);

    mockPatient = new Patient(
      'Juan',
      'Pérez',
      'González',
      'juan@test.com',
      'password123',
      '12345678-9',
      new Date('1980-01-01'),
      '+56912345678',
      'Calle Falsa 123',
      Gender.Male
    );
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registerPatient', () => {
    it('should register a new patient successfully', () => {
      const mockResponse = {
        id: '1',
        name: 'Juan',
        email: 'juan@test.com',
      };

      service.registerPatient(mockPatient).subscribe((response: any) => {
        expect(response).toEqual(
          jasmine.objectContaining({
            id: '1',
            name: 'Juan',
          })
        );
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPatient);
      req.flush(mockResponse);
    });

    it('should handle registration error with invalid data', () => {
      service.registerPatient(mockPatient).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });

  describe('getAllPatients', () => {
    it('should get all active patients by default', () => {
      const mockPatients = [
        { id: '1', name: 'Juan', email: 'juan@test.com', active: true },
        { id: '2', name: 'María', email: 'maria@test.com', active: true },
      ];

      service.getAllPatients().subscribe((patients) => {
        expect(patients).toEqual(jasmine.arrayContaining(mockPatients));
        expect(patients.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPatients);
    });
  });

  describe('getPatientById', () => {
    it('should get patient by ID', () => {
      const patientId = '1';
      const mockResponse = {
        id: patientId,
        name: 'Juan',
        email: 'juan@test.com',
      };

      service.getPatientById(patientId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${patientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle patient not found error', () => {
      const patientId = '999';

      service.getPatientById(patientId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${patientId}`);
      req.flush(
        { message: 'Patient not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('updatePatient', () => {
    it('should update patient successfully', () => {
      const patientId = '1';
      const updatedPatient = new Patient(
        'Juan Updated',
        'Pérez',
        'González',
        'juan@test.com',
        'password123',
        '12345678-9',
        new Date('1980-01-01'),
        '+56912345678',
        'Calle Falsa 123',
        Gender.Male
      );
      const mockResponse = {
        id: patientId,
        name: 'Juan Updated',
        email: 'juan@test.com',
        paternalLastName: 'Pérez',
        maternalLastName: 'González',
        rut: '12345678-9',
        phone: '+56912345678',
        address: 'Calle Falsa 123',
        gender: Gender.Male,
      };

      service.updatePatient(patientId, updatedPatient).subscribe((response) => {
        expect(response).toEqual(
          jasmine.objectContaining({
            id: patientId,
            name: 'Juan Updated',
          })
        );
      });

      const req = httpMock.expectOne(`${apiUrl}/${patientId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPatient);
      req.flush(mockResponse);
    });
  });

  describe('deletePatient', () => {
    it('should delete patient permanently', () => {
      const patientId = '1';
      const mockResponse = { message: 'Patient deleted permanently' };

      service.deletePatient(patientId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${patientId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });
});
