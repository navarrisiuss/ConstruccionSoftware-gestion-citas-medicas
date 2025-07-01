import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { PhysicianDashboardComponent } from './physician-dashboard.component';
import { AuthService } from '../../services/auth.service';

describe('PhysicianDashboardComponent', () => {
  let component: PhysicianDashboardComponent;
  let fixture: ComponentFixture<PhysicianDashboardComponent>;

  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [PhysicianDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockAuthService.getCurrentUser.and.returnValue({
      name: 'Dr. Test',
      role: 'physician',
    });

    fixture = TestBed.createComponent(PhysicianDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentUser from authService on init', () => {
    expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
    expect(component.currentUser).toEqual({
      name: 'Dr. Test',
      role: 'physician',
    });
  });

  it('logout should call authService.logout and navigate to login', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  describe('navigation methods', () => {
    it('goToSchedule should navigate to /physician-schedule', () => {
      component.goToSchedule();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/physician-schedule']);
    });

    it('goToPatients should navigate to /physician-patients', () => {
      component.goToPatients();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/physician-patients']);
    });

    it('goToMedicalHistory should navigate to /physician-medical-history', () => {
      component.goToMedicalHistory();
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/physician-medical-history',
      ]);
    });
  });
});
