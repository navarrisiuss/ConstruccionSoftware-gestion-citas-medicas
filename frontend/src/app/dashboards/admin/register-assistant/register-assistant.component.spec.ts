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

import { RegisterAssistantComponent } from './register-assistant.component';
import { AdminService } from '../../../services/admin.service';
import { Assistant } from '../../../models/assistant.model';

describe('RegisterAssistantComponent', () => {
  let component: RegisterAssistantComponent;
  let fixture: ComponentFixture<RegisterAssistantComponent>;
  let adminService: jasmine.SpyObj<AdminService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    adminService = jasmine.createSpyObj('AdminService', ['registerAssistant']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        RegisterAssistantComponent,
      ],
      providers: [
        { provide: AdminService, useValue: adminService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call service if name is missing', () => {
    component.name = '';
    component.paternalLastName = 'Pat';
    component.email = 'a@b.com';
    component.password = '123456';

    component.registerAssistant();

    expect(adminService.registerAssistant).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('El nombre es requerido');
  });

  it('should not call service if email is invalid', () => {
    component.name = 'Name';
    component.paternalLastName = 'Pat';
    component.email = 'invalid-email';
    component.password = '123456';

    component.registerAssistant();

    expect(adminService.registerAssistant).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Email válido es requerido');
  });

  it('should register and navigate on success', fakeAsync(() => {
    component.name = 'Name';
    component.paternalLastName = 'Pat';
    component.maternalLastName = 'Mat';
    component.email = 'a@b.com';
    component.password = '123456';

    const assistant = new Assistant(
      component.name,
      component.paternalLastName,
      component.maternalLastName,
      component.email,
      component.password
    );
    adminService.registerAssistant.and.returnValue(
      of(
        new Assistant(
          assistant.getName(),
          assistant.getPaternalLastName(),
          assistant.getMaternalLastName(),
          assistant.getEmail(),
          assistant.getPassword()
        )
      )
    );

    component.registerAssistant();

    tick(); // subscription
    expect(component.successMessage).toContain(
      'Asistente registrado exitosamente'
    );
    expect(adminService.registerAssistant).toHaveBeenCalledWith(assistant);

    tick(2000); // navigation delay
    expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  }));

  it('should display error message on failure', fakeAsync(() => {
    component.name = 'Name';
    component.paternalLastName = 'Pat';
    component.maternalLastName = 'Mat';
    component.email = 'a@b.com';
    component.password = '123456';

    adminService.registerAssistant.and.returnValue(
      throwError(() => ({ message: 'Server error' }))
    );

    component.registerAssistant();
    tick();
    fixture.detectChanges();

    expect(component.errorMessage).toBe(
      'Error al registrar asistente: Server error'
    );
  }));

  it('should require paternalLastName', () => {
    component.name = 'Name';
    component.paternalLastName = '';
    component.email = 'a@b.com';
    component.password = '123456';

    component.registerAssistant();

    expect(component.errorMessage).toBe('El apellido paterno es requerido');
    expect(adminService.registerAssistant).not.toHaveBeenCalled();
  });

  it('should require password length >=6', () => {
    component.name = 'Name';
    component.paternalLastName = 'Pat';
    component.email = 'a@b.com';
    component.password = '123';

    component.registerAssistant();

    expect(component.errorMessage).toBe(
      'La contraseña debe tener al menos 6 caracteres'
    );
    expect(adminService.registerAssistant).not.toHaveBeenCalled();
  });

  it('backToDashboard should navigate to /admin-dashboard', () => {
    component.backToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/admin-dashboard']);
  });

  it('should display errorMessage in template on validation error', () => {
    component.errorMessage = 'Nombre requerido';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.error-message');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('Nombre requerido');
  });

  it('should display successMessage in template on successful register', fakeAsync(() => {
    component.successMessage = 'Registrado OK';
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.success-message');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('Registrado OK');
  }));

  it('should disable submit button and show loading text when isLoading', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    expect(btn.disabled).toBeTrue();
    expect(btn.textContent).toContain('Registrando...');
  });

  it('should enable submit button and show default text when not loading', () => {
    component.isLoading = false;
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[type="submit"]'
    );
    expect(btn.disabled).toBeFalse();
    expect(btn.textContent).toContain('Registrar Asistente');
  });

  // TESTS ADICIONALES RECOMENDADOS

  it('should reset form after successful registration', fakeAsync(() => {
    // Setup form with data
    component.name = 'TestName';
    component.paternalLastName = 'TestLastName';
    component.maternalLastName = 'TestMaternal';
    component.email = 'test@example.com';
    component.password = 'password123';

    adminService.registerAssistant.and.returnValue(
      of(new Assistant('', '', '', '', ''))
    );

    component.registerAssistant();
    tick();

    // Verify form is reset
    expect(component.name).toBe('');
    expect(component.paternalLastName).toBe('');
    expect(component.maternalLastName).toBe('');
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  }));

  it('should validate email format correctly', () => {
    // Test invalid email formats
    const invalidEmails = [
      'test',
      'test@',
      '@domain.com',
      'test@domain',
      'test.domain.com',
    ];

    invalidEmails.forEach((email) => {
      component.name = 'Name';
      component.paternalLastName = 'LastName';
      component.email = email;
      component.password = 'password123';

      component.registerAssistant();
      expect(component.errorMessage).toBe('Email válido es requerido');
      expect(adminService.registerAssistant).not.toHaveBeenCalled();
    });
  });

  it('should handle whitespace in required fields', () => {
    component.name = '   '; // Only whitespace
    component.paternalLastName = 'LastName';
    component.email = 'test@example.com';
    component.password = 'password123';

    component.registerAssistant();

    expect(component.errorMessage).toBe('El nombre es requerido');
    expect(adminService.registerAssistant).not.toHaveBeenCalled();
  });

  it('should clear error message before new registration attempt', () => {
    // First attempt with error
    component.errorMessage = 'Previous error';
    component.name = 'Name';
    component.paternalLastName = 'LastName';
    component.email = 'test@example.com';
    component.password = 'password123';

    adminService.registerAssistant.and.returnValue(
      of(new Assistant('', '', '', '', ''))
    );

    component.registerAssistant();

    expect(component.errorMessage).toBe('');
  });

  it('should set isLoading to false after error', fakeAsync(() => {
    component.name = 'Name';
    component.paternalLastName = 'LastName';
    component.email = 'test@example.com';
    component.password = 'password123';

    adminService.registerAssistant.and.returnValue(
      throwError(() => ({ message: 'Server error' }))
    );

    component.registerAssistant();
    tick();

    expect(component.isLoading).toBeFalse();
  }));

  it('should call preventDefault on form submission', () => {
    const form = fixture.debugElement.query(By.css('form'));
    spyOn(Event.prototype, 'preventDefault');

    form.triggerEventHandler('submit', new Event('submit'));

    expect(Event.prototype.preventDefault).toHaveBeenCalled();
  });

  it('should work with maternalLastName as optional field', fakeAsync(() => {
    component.name = 'Name';
    component.paternalLastName = 'LastName';
    component.maternalLastName = ''; // Optional field empty
    component.email = 'test@example.com';
    component.password = 'password123';

    adminService.registerAssistant.and.returnValue(
      of(new Assistant('', '', '', '', ''))
    );

    component.registerAssistant();
    tick();

    expect(adminService.registerAssistant).toHaveBeenCalled();
    expect(component.successMessage).toContain(
      'Asistente registrado exitosamente'
    );
  }));
});
