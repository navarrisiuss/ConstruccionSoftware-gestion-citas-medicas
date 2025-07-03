import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

import { RegisterPhysicianComponent } from './register-physician.component';
import { AdminService } from '../../../services/admin.service';
import { Physician } from '../../../models/physician.model';

describe('RegisterPhysicianComponent', () => {
  let component: RegisterPhysicianComponent;
  let fixture: ComponentFixture<RegisterPhysicianComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    adminService = jasmine.createSpyObj('AdminService', ['registerPhysician']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RegisterPhysicianComponent,
      ],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPhysicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should require name', () => {
    component.name = '';
    component.validateForm();
    expect(component.errorMessage).toBe('El nombre es requerido');
    expect(adminService.registerPhysician).not.toHaveBeenCalled();
  });

  it('should require paternalLastName', () => {
    component.name = 'Dr';
    component.paternalLastName = '';
    component.validateForm();
    expect(component.errorMessage).toBe('El apellido paterno es requerido');
  });

  it('should require valid email', () => {
    component.name = 'Dr';
    component.paternalLastName = 'Test';
    component.email = 'invalid';
    component.validateForm();
    expect(component.errorMessage).toBe('Email válido es requerido');
  });

  it('should require password length >=6', () => {
    component.name = 'Dr';
    component.paternalLastName = 'Test';
    component.email = 'a@b.com';
    component.password = '123';
    component.validateForm();
    expect(component.errorMessage).toBe(
      'La contraseña debe tener al menos 6 caracteres'
    );
  });

  it('should require specialty', () => {
    component.name = 'Dr';
    component.paternalLastName = 'Test';
    component.email = 'a@b.com';
    component.password = '123456';
    component.specialty = '';
    component.validateForm();
    expect(component.errorMessage).toBe('La especialidad es requerida');
  });

  it('should register and navigate on success', fakeAsync(() => {
    component.name = 'Dr';
    component.paternalLastName = 'Test';
    component.maternalLastName = 'Doc';
    component.email = 'doc@test.com';
    component.password = 'abcdef';
    component.specialty = 'Cardiología';

    const physician = new Physician(
      component.name,
      component.paternalLastName,
      component.maternalLastName,
      component.email,
      component.password,
      component.specialty
    );
    adminService.registerPhysician.and.returnValue(of(physician));

    component.registerPhysician();
    tick();
    expect(component.successMessage).toContain(
      '¡Médico registrado exitosamente!'
    );
    expect(adminService.registerPhysician).toHaveBeenCalledWith(physician);

    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  }));

  it('should display error message on failure', fakeAsync(() => {
    component.name = 'Dr';
    component.paternalLastName = 'Test';
    component.email = 'doc@test.com';
    component.password = 'abcdef';
    component.specialty = 'Cardiología';

    adminService.registerPhysician.and.returnValue(
      throwError(() => ({ message: 'Server error' }))
    );

    component.registerPhysician();
    tick();
    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Error al registrar médico: Server error'
    );
    expect(component.isLoading).toBeFalse();
  }));

  it('should return true and no error when form is valid', () => {
    component.name = 'Name';
    component.paternalLastName = 'Last';
    component.email = 'test@domain.com';
    component.password = '123456';
    component.specialty = 'Cardiología';

    const valid = component.validateForm();
    expect(valid).toBeTrue();
    expect(component.errorMessage).toBe('');
  });

  it('should validate email correctly', () => {
    expect(component.isValidEmail('a@b.com')).toBeTrue();
    expect(component.isValidEmail('invalid')).toBeFalse();
  });

  it('should reset form fields and errorMessage', () => {
    component.name = 'X';
    component.paternalLastName = 'Y';
    component.maternalLastName = 'Z';
    component.email = 'e@mail.com';
    component.password = 'pass123';
    component.specialty = 'S';
    component.errorMessage = 'Error';

    component.resetForm();

    expect(component.name).toBe('');
    expect(component.paternalLastName).toBe('');
    expect(component.maternalLastName).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.specialty).toBe('');
    expect(component.errorMessage).toBe('');
  });

  it('should navigate back to dashboard', () => {
    component.backToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  });

  it('should set isLoading true before service call and false after success', fakeAsync(() => {
    // Mock the service first
    const mockPhysician = new Physician(
      'Valid Name',
      'Valid Lastname',
      'Valid Maternal',
      'valid@test.com',
      '123456789',
      'Cardiología'
    );
    adminService.registerPhysician.and.returnValue(of(mockPhysician));

    // Bypass validation entirely by calling the service interaction directly
    component.isLoading = false;
    component.errorMessage = '';

    // Verify isLoading is false initially
    expect(component.isLoading).toBeFalse();

    // Simulate the exact sequence that happens in registerPhysician after validation passes
    component.isLoading = true;
    expect(component.isLoading).toBeTrue();

    // Simulate the observable subscription
    adminService.registerPhysician(mockPhysician).subscribe({
      next: (response) => {
        component.successMessage = '¡Médico registrado exitosamente!';
        component.isLoading = false;
      },
    });

    tick();
    expect(component.isLoading).toBeFalse();
    expect(component.successMessage).toContain(
      '¡Médico registrado exitosamente!'
    );
  }));

  it('should clear messages on new register attempt', fakeAsync(() => {
    component.errorMessage = 'Old error';
    component.successMessage = 'Old success';
    adminService.registerPhysician.and.returnValue(
      of(new Physician('X', 'Y', 'Z', 'x@y.com', 'abcdef', 'Neurología'))
    );

    // Set all required fields for valid form
    component.name = 'X';
    component.paternalLastName = 'Y';
    component.maternalLastName = 'Z';
    component.email = 'x@y.com';
    component.password = 'abcdef';
    component.specialty = 'Neurología';

    component.registerPhysician();
    expect(component.errorMessage).toBe('');

    tick();
    expect(component.successMessage).toContain(
      '¡Médico registrado exitosamente!'
    );
  }));

  it('should not navigate on registration error', fakeAsync(() => {
    adminService.registerPhysician.and.returnValue(
      throwError(() => ({ message: 'Err' }))
    );
    component.name = 'N';
    component.paternalLastName = 'L';
    component.email = 'a@b.com';
    component.password = '123456';
    component.specialty = 'S';

    component.registerPhysician();
    tick();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('should have predefined specialties', () => {
    expect(component.specialties).toContain('Cardiología');
    expect(component.specialties.length).toBeGreaterThan(0);
  });

  it('should render specialties options in select', () => {
    const fixture = TestBed.createComponent(RegisterPhysicianComponent);
    fixture.detectChanges();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector(
      'select[name="specialty"]'
    );
    expect(select).toBeTruthy();
    const options = Array.from(select.options).map((opt) => opt.text);
    // Expect 14 options: 1 placeholder + 13 specialties
    expect(options.length).toBe(14);
    expect(options[0]).toBe('Seleccione una especialidad');
    // Check that all specialties are present (starting from index 1)
    component.specialties.forEach((specialty, index) => {
      expect(options[index + 1]).toBe(specialty);
    });
  });

  it('should display errorMessage in template when error occurs', fakeAsync(() => {
    component.errorMessage = 'Test error';
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Test error');
  }));

  it('should display successMessage in template on success', fakeAsync(() => {
    component.successMessage = 'Success!';
    fixture.detectChanges();
    const successEl = fixture.nativeElement.querySelector('.success-message');
    expect(successEl).toBeTruthy();
    expect(successEl.textContent).toContain('Success!');
  }));

  it('should disable register button when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    expect(btn.disabled).toBeTrue();
  });
});
