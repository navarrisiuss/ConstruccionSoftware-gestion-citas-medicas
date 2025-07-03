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

  it('should display user info in template', () => {
    const user = {
      id: 1,
      name: 'John',
      paternalLastName: 'Doe',
      maternalLastName: 'Smith',
    };
    authService.getCurrentUser.and.returnValue(user);
    component.ngOnInit();
    fixture.detectChanges();
    const span: HTMLElement =
      fixture.nativeElement.querySelector('.user-info span');
    expect(span.textContent).toContain('Bienvenido, John Doe Smith');
  });

  it('should render welcome message and role badge', () => {
    authService.getCurrentUser.and.returnValue({
      name: 'Jane',
      paternalLastName: 'A',
      maternalLastName: 'B',
    });
    component.ngOnInit();
    fixture.detectChanges();
    const welcome: HTMLElement =
      fixture.nativeElement.querySelector('.welcome-message');
    expect(welcome).toBeTruthy();
    expect(welcome.textContent).toContain('Hola, Jane!');
    const badge = welcome.querySelector('.role-badge');
    expect(badge?.textContent).toContain('Asistente Médico');
  });

  it('should trigger logout method on logout button click', () => {
    spyOn(component, 'logout');
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.logout-btn');
    btn.click();
    expect(component.logout).toHaveBeenCalled();
  });

  it('should trigger goToRegisterPatient on register-patient button click', () => {
    spyOn(component, 'goToRegisterPatient');
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.register-patient');
    btn.click();
    expect(component.goToRegisterPatient).toHaveBeenCalled();
  });

  it('should trigger goToManagePatients on manage-patients button click', () => {
    spyOn(component, 'goToManagePatients');
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.manage-patients');
    btn.click();
    expect(component.goToManagePatients).toHaveBeenCalled();
  });

  it('should trigger goToScheduleAppointment on schedule button click', () => {
    spyOn(component, 'goToScheduleAppointment');
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.schedule');
    btn.click();
    expect(component.goToScheduleAppointment).toHaveBeenCalled();
  });

  it('should trigger goToManageAppointments on appointments button click', () => {
    spyOn(component, 'goToManageAppointments');
    fixture.detectChanges();
    const btn: HTMLButtonElement =
      fixture.nativeElement.querySelector('.appointments');
    btn.click();
    expect(component.goToManageAppointments).toHaveBeenCalled();
  });
});
