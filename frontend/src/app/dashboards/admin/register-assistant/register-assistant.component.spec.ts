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
});
