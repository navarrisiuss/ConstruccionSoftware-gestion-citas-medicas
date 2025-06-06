import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { PatientService } from '../../../services/patient.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  let mockPatientService: any;
  let mockRouter: any;

  beforeEach(waitForAsync(() => {
    mockPatientService = jasmine.createSpyObj('PatientService', [
      'registerPatient',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: PatientService, useValue: mockPatientService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    mockPatientService.registerPatient.and.returnValue(of({ success: true }));

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
