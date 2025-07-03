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
      new Date('1990-01-01'),
      '56912345678',
      'Av. Principal 123',
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

      const req = httpMock.expectOne('http://localhost:3000/api/patients');
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

      const req = httpMock.expectOne('http://localhost:3000/api/patients');
      req.flush(
        { message: 'Invalid data' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle server error during registration', () => {
      service.registerPatient(mockPatient).subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/patients');
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });
});
