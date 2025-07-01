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
});
