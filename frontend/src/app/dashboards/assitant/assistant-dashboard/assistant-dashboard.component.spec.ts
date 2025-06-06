import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { AssistantDashboardComponent } from './assistant-dashboard.component';
import { AuthService } from '../../../services/auth.service';

describe('AssistantDashboardComponent', () => {
  let component: AssistantDashboardComponent;
  let fixture: ComponentFixture<AssistantDashboardComponent>;

  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [AssistantDashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockAuthService.getCurrentUser.and.returnValue({
      name: 'Asistente Test',
      role: 'assistant',
    });

    fixture = TestBed.createComponent(AssistantDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
