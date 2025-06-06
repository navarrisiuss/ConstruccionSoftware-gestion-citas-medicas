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
});
