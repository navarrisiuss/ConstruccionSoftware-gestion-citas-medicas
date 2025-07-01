import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AssistantDashboardComponent } from './assistant-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { of } from 'rxjs';

describe('AssistantDashboardComponent', () => {
  let component: AssistantDashboardComponent;
  let fixture: ComponentFixture<AssistantDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AssistantDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssistantDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set currentUser when user exists', () => {
    const user = { id: 1, name: 'Test' };
    authService.getCurrentUser.and.returnValue(user);

    component.ngOnInit();
    expect(component.currentUser).toEqual(user);
    expect(authService.getCurrentUser).toHaveBeenCalled();
  });

  it('logout should call authService.logout and navigate to /login', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('goToRegisterPatient should navigate to /register-patient', () => {
    component.goToRegisterPatient();
    expect(router.navigate).toHaveBeenCalledWith(['/register-patient']);
  });

  it('goToManagePatients should navigate to /assistant-manage-patients', () => {
    component.goToManagePatients();
    expect(router.navigate).toHaveBeenCalledWith([
      '/assistant-manage-patients',
    ]);
  });

  it('goToManageAppointments should navigate to /assistant-manage-appointments', () => {
    component.goToManageAppointments();
    expect(router.navigate).toHaveBeenCalledWith([
      '/assistant-manage-appointments',
    ]);
  });

  it('goToScheduleAppointment should navigate to /assistant-schedule-appointment', () => {
    component.goToScheduleAppointment();
    expect(router.navigate).toHaveBeenCalledWith([
      '/assistant-schedule-appointment',
    ]);
  });
});
