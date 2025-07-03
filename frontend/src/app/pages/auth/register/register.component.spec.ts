import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';
import { Gender } from '../../../models/gender.enum';

let mockPatientService: jasmine.SpyObj<PatientService>;
let mockRouter: jasmine.SpyObj<Router>;

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

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
    mockPatientService.registerPatient.and.returnValue(
      of(
        new Patient(
          'John',
          'Doe',
          'Smith',
          'john@doe.com',
          'pass123',
          '12345678-9',
          new Date('1990-01-01'),
          '5551234',
          'Street 1',
          Gender.Female
        )
      )
    );
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build patient and call registerPatient', () => {
    component.name = 'John';
    component.paternalLastName = 'Doe';
    component.maternalLastName = 'Smith';
    component.email = 'john@doe.com';
    component.password = 'pass123';
    component.rut = '12345678-9';
    component.birthDate = '1990-01-01';
    component.phone = '5551234';
    component.address = 'Street 1';
    component.gender = Gender.Female;

    component.register();

    const expected = new Patient(
      'John',
      'Doe',
      'Smith',
      'john@doe.com',
      'pass123',
      '12345678-9',
      new Date('1990-01-01'),
      '5551234',
      'Street 1',
      Gender.Female
    );
    expect(mockPatientService.registerPatient).toHaveBeenCalledWith(expected);
  });

  it('should reset form fields after register', () => {
    component.name = 'A';
    component.email = 'e';
    // set others to non-default
    component.register();
    expect(component.name).toBe('');
    expect(component.email).toBe('');
  });

  it('backToHome should navigate to /home', () => {
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    component.backToHome();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });
});
