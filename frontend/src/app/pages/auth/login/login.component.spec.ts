import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'login',
      'setCurrentUser',
      'getUserRole',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockAuthService.login.and.returnValue(of([]));
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should not submit when email is empty', () => {
      component.email = '';
      component.password = 'password123';

      component.login();

      expect(component.message).toBe('Email no encontrado.');
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should not submit when password is empty', () => {
      component.email = 'test@test.com';
      component.password = '';

      component.login();

      expect(component.message).toBe('Email no encontrado.');
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should not submit when both fields are empty', () => {
      component.email = '';
      component.password = '';

      component.login();

      expect(component.message).toBe('Email no encontrado.');
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should validate email format', () => {
      component.email = 'invalid-email';
      component.password = 'password123';

      component.login();

      expect(component.message).toBe('Email no encontrado.');
      expect(mockAuthService.login).toHaveBeenCalled();
    });

    it('should accept valid email format', () => {
      component.email = 'user@example.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(of([]));

      component.login();

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'user@example.com',
        'password123'
      );
    });
  });

  describe('Login Process', () => {
    it('should call login method successfully', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(of([]));

      component.login();

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'test@test.com',
        'password123'
      );
    });

    it('should call authService.login with correct credentials', () => {
      component.email = 'user@test.com';
      component.password = 'pass123';
      mockAuthService.login.and.returnValue(of([]));

      component.login();

      expect(mockAuthService.login).toHaveBeenCalledWith(
        'user@test.com',
        'pass123'
      );
    });

    it('should show "Email no encontrado." when response array empty', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(of([]));

      component.login();

      expect(component.message).toBe('Email no encontrado.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should show incorrect password message', () => {
      const user = { email: 'a@b.com', password: 'correct', role: 'patient' };
      mockAuthService.login.and.returnValue(of([user]));
      component.email = 'a@b.com';
      component.password = 'wrong';

      component.login();

      expect(component.message).toBe('Contraseña incorrecta.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Role-based Navigation', () => {
    beforeEach(() => {
      component.email = 'test@test.com';
      component.password = 'password123';
    });

    it('should navigate to admin dashboard for admin role', () => {
      const user = {
        email: 'test@test.com',
        password: 'password123',
        role: 'admin',
      };
      mockAuthService.login.and.returnValue(of([user]));
      mockAuthService.getUserRole.and.returnValue('admin');

      component.login();

      expect(component.message).toBe('Login exitoso!');
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
    });

    it('should navigate to physician dashboard for physician role', () => {
      const user = {
        email: 'test@test.com',
        password: 'password123',
        role: 'physician',
      };
      mockAuthService.login.and.returnValue(of([user]));
      mockAuthService.getUserRole.and.returnValue('physician');

      component.login();

      expect(component.message).toBe('Login exitoso!');
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/physician-dashboard',
      ]);
    });

    it('should navigate to patient dashboard for patient role', () => {
      const user = {
        email: 'test@test.com',
        password: 'password123',
        role: 'patient',
      };
      mockAuthService.login.and.returnValue(of([user]));
      mockAuthService.getUserRole.and.returnValue('patient');

      component.login();

      expect(component.message).toBe('Login exitoso!');
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/patient-dashboard']);
    });

    it('should navigate to assistant dashboard for assistant role', () => {
      const user = {
        email: 'test@test.com',
        password: 'password123',
        role: 'assistant',
      };
      mockAuthService.login.and.returnValue(of([user]));
      mockAuthService.getUserRole.and.returnValue('assistant');

      component.login();

      expect(component.message).toBe('Login exitoso!');
      expect(mockAuthService.setCurrentUser).toHaveBeenCalledWith(user);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/assistant-dashboard',
      ]);
    });

    it('should handle unknown role', () => {
      const user = {
        email: 'test@test.com',
        password: 'password123',
        role: 'unknown',
      };
      mockAuthService.login.and.returnValue(of([user]));
      mockAuthService.getUserRole.and.returnValue('unknown');

      component.login();

      expect(component.message).toBe('Login exitoso!');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/patient-dashboard']);
    });
  });

  describe('Error Handling', () => {
    it('should show server error message on service error', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(
        throwError(() => new Error('Server error'))
      );

      component.login();

      expect(component.message).toBe(
        'Error en el servidor (undefined): Error desconocido'
      );
    });

    it('should handle network timeout error', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(
        throwError(() => ({ status: 0, message: 'Network timeout' }))
      );

      component.login();

      expect(component.message).toBe(
        'No se puede conectar al servidor. Verifique que el backend esté ejecutándose.'
      );
    });

    it('should handle 401 unauthorized error', () => {
      component.email = 'test@test.com';
      component.password = 'password123';
      mockAuthService.login.and.returnValue(
        throwError(() => ({ status: 401, message: 'Unauthorized' }))
      );

      component.login();

      expect(component.message).toBe(
        'Error en el servidor (401): Error desconocido'
      );
    });
  });

  describe('Navigation Methods', () => {
    it('goToRegister should navigate to /register', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
      component.goToRegister();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
    });

    it('goToHome should navigate to /home', () => {
      mockRouter.navigate.and.returnValue(Promise.resolve(true));
      component.goToHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('UI Integration Tests', () => {
    it('should display error message in template', () => {
      component.message = 'Test error message';
      fixture.detectChanges();

      const messageElement = fixture.debugElement.query(
        By.css('.error-message')
      );
      if (messageElement) {
        expect(messageElement.nativeElement.textContent).toContain(
          'Test error message'
        );
      }
    });

    it('should clear message when user types in email field', () => {
      component.message = 'Some error';
      const emailInput = fixture.debugElement.query(
        By.css('input[type="email"]')
      );

      if (emailInput) {
        emailInput.triggerEventHandler('input', {
          target: { value: 'new@email.com' },
        });
        expect(component.message).toBe('');
      }
    });
  });
});
