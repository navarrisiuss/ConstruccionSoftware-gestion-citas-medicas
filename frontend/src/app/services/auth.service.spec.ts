import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login with valid credentials', () => {
      const mockResponse = [{ email: 'test@test.com', role: 'admin' }];

      service.login('test@test.com', 'password').subscribe((response: any) => {
        expect(response).toEqual(jasmine.objectContaining(mockResponse));
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/auth?email=test@test.com'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle login error', () => {
      service.login('test@test.com', 'wrongpassword').subscribe({
        next: () => fail('should have failed'),
        error: (error: any) => {
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne(
        'http://localhost:3000/api/auth?email=test@test.com'
      );
      req.flush(
        { message: 'Unauthorized' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('User Management', () => {
    it('should set and get current user', () => {
      const mockUser = { email: 'test@test.com', role: 'admin' };
      service.setCurrentUser(mockUser);

      expect(service.getCurrentUser()).toEqual(mockUser);
      expect(localStorage.getItem('currentUser')).toBe(
        JSON.stringify(mockUser)
      );
    });

    it('should return null when no user is set', () => {
      expect(service.getCurrentUser()).toBeNull();
    });

    it('should return admin role for admin user', () => {
      service.setCurrentUser({ email: 'test@admin.com', role: 'admin' });
      expect(service.getUserRole()).toBe('admin');
    });

    it('should return physician role for user with specialty', () => {
      service.setCurrentUser({
        email: 'doctor@test.com',
        specialty: 'cardiology',
      });
      expect(service.getUserRole()).toBe('physician');
    });

    it('should return assistant role for assistant user', () => {
      service.setCurrentUser({
        email: 'assistant@test.com',
        role: 'assistant',
      });
      expect(service.getUserRole()).toBe('assistant');
    });

    it('should return patient role by default', () => {
      service.setCurrentUser({ email: 'patient@test.com' });
      expect(service.getUserRole()).toBe('patient');
    });

    it('should return empty string when no user is set', () => {
      expect(service.getUserRole()).toBe('');
    });

    it('should logout and clear user data', () => {
      const mockUser = { email: 'test@test.com', role: 'admin' };
      service.setCurrentUser(mockUser);
      service.logout();

      expect(service.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});
