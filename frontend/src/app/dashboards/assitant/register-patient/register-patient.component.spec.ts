import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

import { RegisterPatientComponent } from './register-patient.component';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';
import { Gender } from '../../../models/gender.enum';

describe('RegisterPatientComponent', () => {
  let component: RegisterPatientComponent;
  let fixture: ComponentFixture<RegisterPatientComponent>;
  let patientService: jasmine.SpyObj<PatientService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    patientService = jasmine.createSpyObj('PatientService', [
      'registerPatient',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        HttpClientTestingModule,
        RegisterPatientComponent,
      ],
      providers: [
        { provide: PatientService, useValue: patientService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should require name', () => {
      component.name = '';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('El nombre es requerido');
    });

    it('should require paternal last name', () => {
      component.name = 'Juan';
      component.paternalLastName = '';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('El apellido paterno es requerido');
    });

    it('should require valid email', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'invalid-email';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('Email válido es requerido');
    });

    it('should require password with minimum 6 characters', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe(
        'La contraseña debe tener al menos 6 caracteres'
      );
    });

    it('should require RUT', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('El RUT es requerido');
    });

    it('should require birth date', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '';
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe(
        'La fecha de nacimiento es requerida'
      );
    });

    it('should require phone', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('El teléfono es requerido');
    });

    it('should require address', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = '';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe('La dirección es requerida');
    });

    it('should reject future birth dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.email = 'test@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = futureDate.toISOString().split('T')[0];
      component.phone = '56912345678';
      component.address = 'Test Address';

      const isValid = component.validateForm();

      expect(isValid).toBe(false);
      expect(component.errorMessage).toBe(
        'La fecha de nacimiento debe ser anterior a hoy'
      );
    });

    it('should pass validation with all required fields', () => {
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.maternalLastName = 'González';
      component.email = 'juan@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Av. Principal 123';

      const isValid = component.validateForm();

      expect(isValid).toBe(true);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(component.isValidEmail('test@test.com')).toBe(true);
      expect(component.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(component.isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(component.isValidEmail('invalid-email')).toBe(false);
      expect(component.isValidEmail('test@')).toBe(false);
      expect(component.isValidEmail('@domain.com')).toBe(false);
      expect(component.isValidEmail('test.domain.com')).toBe(false);
    });
  });

  describe('Patient Registration', () => {
    beforeEach(() => {
      // Set up valid form data
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.maternalLastName = 'González';
      component.email = 'juan@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Av. Principal 123';
      component.gender = Gender.Male;
    });

    it('should register patient successfully', fakeAsync(() => {
      const mockPatient = new Patient(
        'Juan',
        'Pérez',
        'González',
        'juan@test.com',
        '123456',
        '12345678-9',
        new Date('1990-01-01'),
        '56912345678',
        'Av. Principal 123',
        Gender.Male
      );
      patientService.registerPatient.and.returnValue(of(mockPatient));

      component.registerPatient();

      // Wait for the observable to complete
      tick();

      expect(patientService.registerPatient).toHaveBeenCalledWith(
        jasmine.any(Patient)
      );
      expect(component.successMessage).toBe(
        '¡Paciente registrado exitosamente!'
      );
      expect(component.isLoading).toBe(false);

      tick(2000);
      expect(router.navigate).toHaveBeenCalledWith(['/assistant-dashboard']);
    }));

    it('should handle registration error', fakeAsync(() => {
      const mockError = { message: 'Server error' };
      patientService.registerPatient.and.returnValue(
        throwError(() => mockError)
      );

      component.registerPatient();

      tick(); // Let the error handling execute

      expect(component.errorMessage).toBe(
        'Error al registrar paciente: Server error'
      );
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should handle registration error without message', fakeAsync(() => {
      const mockError = {};
      patientService.registerPatient.and.returnValue(
        throwError(() => mockError)
      );

      component.registerPatient();
      tick();

      expect(component.errorMessage).toBe(
        'Error al registrar paciente: Error del servidor'
      );
    }));

    it('should not call service if validation fails', () => {
      component.name = ''; // Invalid form

      component.registerPatient();

      expect(patientService.registerPatient).not.toHaveBeenCalled();
      expect(component.errorMessage).toBe('El nombre es requerido');
    });

    it('should clear messages before registration', () => {
      component.errorMessage = 'Previous error';
      component.successMessage = 'Previous success';

      // Mock the service to return an Observable that never completes
      patientService.registerPatient.and.returnValue(new Observable(() => {})); // Never emits

      component.registerPatient();

      // Immediately after calling registerPatient, messages should be cleared
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');

      // This test is specifically about clearing messages at the start
      // We don't want the observable to complete in this test
    });
  });

  describe('Form Reset', () => {
    it('should reset all form fields and messages', () => {
      // Set form values
      component.name = 'Juan';
      component.paternalLastName = 'Pérez';
      component.maternalLastName = 'González';
      component.email = 'juan@test.com';
      component.password = '123456';
      component.rut = '12345678-9';
      component.birthDate = '1990-01-01';
      component.phone = '56912345678';
      component.address = 'Av. Principal 123';
      component.gender = Gender.Female;
      component.errorMessage = 'Test error';
      component.successMessage = 'Test success';

      component.resetForm();

      expect(component.name).toBe('');
      expect(component.paternalLastName).toBe('');
      expect(component.maternalLastName).toBe('');
      expect(component.email).toBe('');
      expect(component.password).toBe('');
      expect(component.rut).toBe('');
      expect(component.birthDate).toBe('');
      expect(component.phone).toBe('');
      expect(component.address).toBe('');
      expect(component.gender as Gender).toBe(Gender.Male);
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to assistant dashboard', () => {
      component.backToDashboard();
      expect(router.navigate).toHaveBeenCalledWith(['/assistant-dashboard']);
    });
  });

  describe('Gender Options', () => {
    it('should have correct gender options', () => {
      expect(component.genders).toEqual([
        { value: Gender.Male, label: 'Masculino' },
        { value: Gender.Female, label: 'Femenino' },
      ]);
    });
  });

  describe('UI Integration', () => {
    it('should display error message in template', () => {
      component.errorMessage = 'Test error message';
      fixture.detectChanges();

      const errorElement =
        fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent.trim()).toBe('Test error message');
    });

    it('should display success message in template', () => {
      component.successMessage = 'Test success message';
      fixture.detectChanges();

      const successElement =
        fixture.nativeElement.querySelector('.success-message');
      expect(successElement).toBeTruthy();
      expect(successElement.textContent.trim()).toBe('Test success message');
    });

    it('should disable submit button when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.textContent.trim()).toBe('Registrando...');
    });

    it('should enable submit button when not loading', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const submitButton = fixture.nativeElement.querySelector(
        'button[type="submit"]'
      );
      expect(submitButton.disabled).toBe(false);
      expect(submitButton.textContent.trim()).toBe('Registrar Paciente');
    });

    it('should render all gender options', () => {
      fixture.detectChanges();

      const genderSelect = fixture.nativeElement.querySelector(
        'select[name="gender"]'
      );
      const options = Array.from(genderSelect.options).map(
        (opt: any) => opt.text
      );

      expect(options).toContain('Masculino');
      expect(options).toContain('Femenino');
    });

    it('should call backToDashboard when back button is clicked', () => {
      spyOn(component, 'backToDashboard');
      fixture.detectChanges();

      const backButton = fixture.nativeElement.querySelector('.back-btn');
      backButton.click();

      expect(component.backToDashboard).toHaveBeenCalled();
    });

    it('should call resetForm when reset button is clicked', () => {
      spyOn(component, 'resetForm');
      fixture.detectChanges();

      const resetButton = fixture.nativeElement.querySelector('.btn-secondary');
      resetButton.click();

      expect(component.resetForm).toHaveBeenCalled();
    });
  });
});
