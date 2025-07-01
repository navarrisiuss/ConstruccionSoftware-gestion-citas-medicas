import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PatientDashboardComponent } from './patient-dashboard.component';
import { AuthService } from '../../../services/auth.service';

describe('PatientDashboardComponent', () => {
  let component: PatientDashboardComponent;
  let fixture: ComponentFixture<PatientDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  const mockUser = {
    name: 'John',
    paternalLastName: 'Doe',
    maternalLastName: 'Smith',
  };

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);
    authService.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, PatientDashboardComponent],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create component and set currentUser on init', () => {
    fixture.detectChanges(); // calls ngOnInit

    expect(component).toBeTruthy();
    expect(authService.getCurrentUser).toHaveBeenCalled();
    expect(component.currentUser).toEqual(mockUser);

    const span: HTMLElement =
      fixture.nativeElement.querySelector('.user-info span');
    expect(span.textContent).toContain('John');
  });

  it('goToNewAppointment should navigate to appointment-form', () => {
    spyOn(router, 'navigate');
    component.goToNewAppointment();
    expect(router.navigate).toHaveBeenCalledWith(['/appointment-form']);
  });

  it('goToAppointmentHistory should navigate to patient-appointment-history', () => {
    spyOn(router, 'navigate');
    component.goToAppointmentHistory();
    expect(router.navigate).toHaveBeenCalledWith([
      '/patient-appointment-history',
    ]);
  });

  it('goToHelpChat should navigate to patient-help-chat', () => {
    spyOn(router, 'navigate');
    component.goToHelpChat();
    expect(router.navigate).toHaveBeenCalledWith(['/patient-help-chat']);
  });

  it('logout should call authService.logout and navigate to login', () => {
    spyOn(router, 'navigate');
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
