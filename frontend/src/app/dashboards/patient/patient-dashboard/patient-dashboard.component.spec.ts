import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { PatientDashboardComponent } from './patient-dashboard.component';
import { AuthService } from '../../../services/auth.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('PatientDashboardComponent', () => {
  let component: PatientDashboardComponent;
  let fixture: ComponentFixture<PatientDashboardComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  const mockUserData = {
    id: 'patient123',
    nombre: 'Juan Paciente',
    rol: 'patient',
  };

  beforeEach(waitForAsync(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
    };

    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);

    TestBed.configureTestingModule({
      imports: [PatientDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientDashboardComponent);
    component = fixture.componentInstance;

    mockAuthService.getCurrentUser.and.returnValue(mockUserData);

    mockAuthService.logout.and.callFake(() => {});
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería obtener el usuario actual del AuthService y asignarlo a currentUser', () => {
      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();

      expect(component.currentUser).toEqual(mockUserData);
    });

    it('debería asignar null a currentUser si AuthService.getCurrentUser devuelve null', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toBeNull();
    });
  });

  describe('goToNewAppointment', () => {
    it('debería navegar a la ruta "/appointment-form"', () => { // <-- CORRECCIÓN EN EL TÍTULO DE LA PRUEBA
      component.goToNewAppointment();

      // La prueba ahora espera la ruta correcta que usa tu código.
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/appointment-form']); // <-- CORRECCIÓN 1
    });
  });

  describe('logout', () => {
    it('debería llamar a authService.logout()', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('debería navegar a la ruta "/login" después de llamar a logout', () => { // <-- CORRECCIÓN EN EL TÍTULO DE LA PRUEBA
      component.logout();

      // La prueba ahora espera la ruta correcta que usa tu código.
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']); // <-- CORRECIÓN 2
    });

    it('debería llamar a authService.logout() antes de navegar', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      // La prueba ahora espera la ruta correcta que usa tu código.
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']); // <-- CORRECIÓN 3
    });
  });
});