import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { PhysicianService } from './physician.service';
import { Physician } from '../models/physician.model';

describe('PhysicianService', () => {
  let service: PhysicianService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/physicians';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PhysicianService],
    });
    service = TestBed.inject(PhysicianService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllPhysicians', () => {
    it('should retrieve all physicians', () => {
      const mockPhysicians = [
        new Physician(
          'Dr. Juan',
          'Pérez',
          'González',
          'juan@hospital.com',
          'password123',
          'Cardiología'
        ),
        new Physician(
          'Dr. María',
          'Silva',
          'Castro',
          'maria@hospital.com',
          'password456',
          'Neurología'
        ),
      ];

      service.getAllPhysicians().subscribe((physicians) => {
        expect(physicians.length).toBe(2);
        expect(physicians).toEqual(mockPhysicians);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysicians);
    });

    it('should handle error when retrieving all physicians', () => {
      service.getAllPhysicians().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Internal server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );
    });
  });

  describe('getPhysicianById', () => {
    it('should retrieve a physician by ID', () => {
      const physicianId = '1';
      const mockPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        'Cardiología'
      );

      service.getPhysicianById(physicianId).subscribe((physician) => {
        expect(physician).toEqual(mockPhysician);
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysician);
    });

    it('should handle error when physician not found', () => {
      const physicianId = 'non-existent';

      service.getPhysicianById(physicianId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      req.flush(
        { message: 'Physician not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('getPhysiciansBySpecialty', () => {
    it('should retrieve physicians by specialty', () => {
      const specialty = 'Cardiología';
      const mockPhysicians = [
        new Physician(
          'Dr. Juan',
          'Pérez',
          'González',
          'juan@hospital.com',
          'password123',
          'Cardiología'
        ),
        new Physician(
          'Dr. Ana',
          'López',
          'Martín',
          'ana@hospital.com',
          'password789',
          'Cardiología'
        ),
      ];

      service.getPhysiciansBySpecialty(specialty).subscribe((physicians) => {
        expect(physicians.length).toBe(2);
        expect(physicians).toEqual(mockPhysicians);
        physicians.forEach((physician) => {
          expect(physician.getSpecialty()).toBe('Cardiología');
        });
      });

      const req = httpMock.expectOne(`${apiUrl}/specialty/${specialty}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPhysicians);
    });

    it('should return empty array when no physicians found for specialty', () => {
      const specialty = 'Especialidad Inexistente';

      service.getPhysiciansBySpecialty(specialty).subscribe((physicians) => {
        expect(physicians.length).toBe(0);
      });

      const req = httpMock.expectOne(`${apiUrl}/specialty/${specialty}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('registerPhysician', () => {
    it('should register a new physician successfully', () => {
      const newPhysician = new Physician(
        'Dr. Carlos',
        'Rodríguez',
        'Martínez',
        'carlos@hospital.com',
        'password999',
        'Pediatría'
      );
      const mockResponse = { id: '1', ...newPhysician };

      service.registerPhysician(newPhysician).subscribe((response) => {
        expect(response).toEqual(jasmine.objectContaining(mockResponse));
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPhysician);
      req.flush(mockResponse);
    });

    it('should handle validation errors during registration', () => {
      const invalidPhysician = new Physician(
        '',
        'Pérez',
        'González',
        'invalid-email',
        'password123',
        'Cardiología'
      );

      service.registerPhysician(invalidPhysician).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Validation failed' },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should handle duplicate email error', () => {
      const duplicatePhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'existing@hospital.com',
        'password123',
        'Cardiología'
      );

      service.registerPhysician(duplicatePhysician).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Email already exists' },
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('updatePhysician', () => {
    it('should update a physician successfully', () => {
      const physicianId = '1';
      const updatedPhysician = new Physician(
        'Dr. Juan Updated',
        'Pérez',
        'González',
        'juan.updated@hospital.com',
        'newpassword123',
        'Cardiología Avanzada'
      );
      const mockResponse = { id: physicianId, ...updatedPhysician };

      service
        .updatePhysician(physicianId, updatedPhysician)
        .subscribe((response) => {
          expect(response).toEqual(jasmine.objectContaining(mockResponse));
        });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedPhysician);
      req.flush(mockResponse);
    });

    it('should handle update error when physician not found', () => {
      const physicianId = 'non-existent';
      const updatedPhysician = new Physician(
        'Dr. Juan',
        'Pérez',
        'González',
        'juan@hospital.com',
        'password123',
        'Cardiología'
      );

      service.updatePhysician(physicianId, updatedPhysician).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      req.flush(
        { message: 'Physician not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });
  });

  describe('deletePhysician', () => {
    it('should delete a physician successfully', () => {
      const physicianId = '1';

      service.deletePhysician(physicianId).subscribe((response) => {
        expect(response).toEqual({ success: true });
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });

    it('should handle delete error when physician not found', () => {
      const physicianId = 'non-existent';

      service.deletePhysician(physicianId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      req.flush(
        { message: 'Physician not found' },
        { status: 404, statusText: 'Not Found' }
      );
    });

    it('should handle delete error when physician has active appointments', () => {
      const physicianId = '1';

      service.deletePhysician(physicianId).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(409);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${physicianId}`);
      req.flush(
        { message: 'Cannot delete physician with active appointments' },
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      service.getAllPhysicians().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(0);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Network error' },
        { status: 0, statusText: 'Network Error' }
      );
    });

    it('should handle unauthorized access', () => {
      service.getAllPhysicians().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });
});
