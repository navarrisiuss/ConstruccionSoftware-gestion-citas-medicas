import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { AppointmentFormComponent } from './appointment-form.component';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { PhysicianService } from '../../../../services/physician.service';
import { Physician } from '../../../../models/physician.model';

// ✅ Add type declaration for window.Swal
declare global {
  interface Window {
    Swal: typeof Swal;
  }
}

describe('AppointmentFormComponent', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPhysicianService: jasmine.SpyObj<PhysicianService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSwalFire: jasmine.Spy;

  const mockCurrentUser = {
    id: 1,
    name: 'Juan',
    paternalLastName: 'Pérez',
    maternalLastName: 'González',
    email: 'juan@test.com',
  };

  const mockPhysicians = [
    new Physician(
      'Dr. María',
      'García',
      'López',
      'maria@hospital.com',
      'password123',
      'Cardiología'
    ),
    new Physician(
      'Dr. Carlos',
      'Rodríguez',
      'Silva',
      'carlos@hospital.com',
      'password456',
      'Neurología'
    ),
    new Physician(
      'Dr. Ana',
      'Martínez',
      'Castro',
      'ana@hospital.com',
      'password789',
      'Cardiología'
    ),
  ];

  const mockAppointments = [
    {
      id: 1,
      date: '2025-07-15',
      time: '10:00',
      physician_name: 'Dr. María García',
      patient_name: 'Juan Pérez',
      patient_id: 1,
      status: 'confirmed',
    },
    {
      id: 2,
      date: '2025-07-15',
      time: '11:00',
      physician_name: 'Dr. Carlos Rodríguez',
      patient_name: 'Ana Silva',
      patient_id: 2,
      status: 'confirmed',
    },
  ];

  beforeEach(async () => {
    // Create SweetAlert mock
    mockSwalFire = jasmine
      .createSpy('Swal.fire')
      .and.returnValue(Promise.resolve({ isConfirmed: true }));

    // Mock the SweetAlert import - make it configurable to avoid redefinition errors
    Object.defineProperty(window, 'Swal', {
      value: { fire: mockSwalFire },
      writable: true,
      configurable: true, // ✅ Add configurable: true
    });

    mockAdminService = jasmine.createSpyObj('AdminService', [
      'getAllAppointments',
      'createAppointment',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockPhysicianService = jasmine.createSpyObj('PhysicianService', [
      'getAllPhysicians',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        AppointmentFormComponent,
        HttpClientTestingModule,
        FormsModule,
        CommonModule,
      ],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PhysicianService, useValue: mockPhysicianService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentFormComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Reset the mock before each test
    mockSwalFire.calls.reset();

    // Ensure Swal.fire is always using our mock
    if (window.Swal) {
      window.Swal.fire = mockSwalFire;
    }
  });

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should redirect to login if no authenticated user', fakeAsync(() => {
      // Configurar que no hay usuario autenticado
      mockAuthService.getCurrentUser.and.returnValue(null);

      // Configurar el mock de Swal.fire para que retorne una promesa resuelta
      const swalPromise = Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
      });
      mockSwalFire.and.returnValue(swalPromise);

      // Ejecutar ngOnInit manualmente
      component.ngOnInit();

      // Verificar que se muestra el mensaje de sesión expirada
      expect(mockSwalFire).toHaveBeenCalledWith({
        title: 'Sesión Expirada',
        text: 'Debe iniciar sesión para agendar citas',
        icon: 'warning',
        confirmButtonText: 'Ir a Login',
      });

      // Procesar microtasks y macrotasks para que la promesa se resuelva completamente
      tick();
      flush();

      // Ahora verificar que se navega al login después del Swal
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should initialize with authenticated user', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
      mockPhysicianService.getAllPhysicians.and.returnValue(of(mockPhysicians));
      mockAdminService.getAllAppointments.and.returnValue(of(mockAppointments));

      component.ngOnInit();
      tick();

      expect(component.currentUser).toEqual(mockCurrentUser);
      expect(component.patientId).toBe('1');
      expect(component.newAppt.patient_id).toBe('1');
      expect(mockPhysicianService.getAllPhysicians).toHaveBeenCalled();
      expect(mockAdminService.getAllAppointments).toHaveBeenCalled();
    }));

    it('should generate time slots correctly', () => {
      component.generateTimeSlots();

      expect(component.availableTimes).toContain('09:00');
      expect(component.availableTimes).toContain('09:30');
      expect(component.availableTimes).toContain('17:00');
      expect(component.availableTimes).toContain('17:30');
      expect(component.availableTimes.length).toBeGreaterThan(15);
    });
  });

  describe('Physician Management', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
      mockAdminService.getAllAppointments.and.returnValue(of([]));
    });

    it('should load and process physicians correctly', fakeAsync(() => {
      mockPhysicianService.getAllPhysicians.and.returnValue(of(mockPhysicians));

      component.ngOnInit();
      tick();

      expect(component.allPhysicians.length).toBe(3);
      expect(component.allPhysicians[0].fullName).toBe(
        'Dr. María García López'
      );
      expect(component.allPhysicians[0].specialty).toBe('Cardiología');
    }));

    it('should calculate specialty counts correctly', fakeAsync(() => {
      mockPhysicianService.getAllPhysicians.and.returnValue(of(mockPhysicians));

      component.ngOnInit();
      tick();

      const cardiologyCount = component.getPhysicianCount('Cardiología');
      const neurologyCount = component.getPhysicianCount('Neurología');

      expect(cardiologyCount).toBe(2);
      expect(neurologyCount).toBe(1);
    }));

    it('should filter physicians by specialty', fakeAsync(() => {
      mockPhysicianService.getAllPhysicians.and.returnValue(of(mockPhysicians));

      component.ngOnInit();
      tick();

      component.newAppt.specialty = 'Cardiología';
      component.onSpecialtyChange();

      expect(component.filteredPhysicians.length).toBe(2);
      expect(
        component.filteredPhysicians.every((p) => p.specialty === 'Cardiología')
      ).toBe(true);
    }));

    it('should clear physician selection when specialty changes and physician not in filtered list', fakeAsync(() => {
      mockPhysicianService.getAllPhysicians.and.returnValue(of(mockPhysicians));

      component.ngOnInit();
      tick();

      component.newAppt.physician_id = '2'; // Neurología physician
      component.newAppt.specialty = 'Cardiología';
      component.onSpecialtyChange();

      expect(component.newAppt.physician_id).toBe('');
    }));

    it('should handle physician loading error', fakeAsync(() => {
      mockPhysicianService.getAllPhysicians.and.returnValue(
        throwError(() => new Error('Server error'))
      );
      spyOn(console, 'error');

      component.ngOnInit();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Error cargando médicos:',
        jasmine.any(Error)
      );
    }));
  });

  describe('Appointment Management', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
      mockPhysicianService.getAllPhysicians.and.returnValue(of([]));
    });

    it('should load and process appointments correctly', fakeAsync(() => {
      mockAdminService.getAllAppointments.and.returnValue(of(mockAppointments));

      component.ngOnInit();
      tick();

      expect(component.appointments.length).toBe(2);
      expect(component.appointments[0].isCurrentPatient).toBe(true);
      expect(component.appointments[1].isCurrentPatient).toBe(false);
    }));

    it('should submit appointment successfully', fakeAsync(() => {
      mockAdminService.createAppointment.and.returnValue(of({ id: 1 }));
      mockAdminService.getAllAppointments.and.returnValue(of([]));

      component.patientId = '1';
      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
      };

      component.submit();
      tick();

      expect(mockAdminService.createAppointment).toHaveBeenCalledWith({
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
      });
      expect(mockAdminService.getAllAppointments).toHaveBeenCalled();
    }));

    it('should validate required fields before submission', () => {
      spyOn(window, 'alert').and.stub(); // Mock SweetAlert

      component.newAppt = {
        patient_id: '1',
        physician_id: '',
        date: '',
        time: '',
        specialty: '',
      };

      component.submit();

      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });

    it('should reject past dates', () => {
      spyOn(window, 'alert').and.stub(); // Mock SweetAlert
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: pastDate.toISOString().split('T')[0],
        time: '10:00',
        specialty: 'Cardiología',
      };

      component.submit();

      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });

    it('should handle appointment creation error', fakeAsync(() => {
      // Configurar el error 409
      mockAdminService.createAppointment.and.returnValue(
        throwError({ status: 409 })
      );

      // Configurar datos del formulario y asegurar que patientId esté configurado
      component.patientId = '1';
      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
      };

      // Llamar al método submit
      component.submit();

      // Esperar a que se procese la respuesta del error
      tick();

      // Verificar que se muestra el mensaje de error correcto
      expect(mockSwalFire).toHaveBeenCalledWith({
        title: 'Horario no disponible',
        text: 'El médico ya tiene una cita agendada en esa fecha y hora. Por favor seleccione otro horario.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });

      flush();
    }));

    it('should handle appointment loading error', fakeAsync(() => {
      mockAdminService.getAllAppointments.and.returnValue(
        throwError(() => new Error('Server error'))
      );
      spyOn(console, 'error');

      component.ngOnInit();
      tick();

      expect(console.error).toHaveBeenCalledWith(
        'Error al cargar citas:',
        jasmine.any(Error)
      );
    }));
  });

  describe('Calendar Functionality', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
      mockPhysicianService.getAllPhysicians.and.returnValue(of([]));
      mockAdminService.getAllAppointments.and.returnValue(of(mockAppointments));
    });

    it('should generate calendar with appointments', fakeAsync(() => {
      component.ngOnInit();
      tick();

      expect(component.calendarDays.length).toBeGreaterThan(0);
    }));

    it('should navigate to previous month', () => {
      const currentMonth = component.currentDate.getMonth();
      component.previousMonth();
      expect(component.currentDate.getMonth()).toBe(currentMonth - 1);
    });

    it('should navigate to next month', () => {
      const currentMonth = component.currentDate.getMonth();
      component.nextMonth();
      expect(component.currentDate.getMonth()).toBe(currentMonth + 1);
    });

    it('should identify today correctly', () => {
      const today = new Date();
      const result = component.isToday(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      expect(result).toBe(true);
    });

    it('should get month name in Spanish', () => {
      component.currentDate = new Date(2025, 6); // July
      const monthName = component.getMonthName();
      expect(monthName).toContain('julio');
      expect(monthName).toContain('2025');
    });

    it('should show day details with appointments', () => {
      spyOn(window, 'alert').and.stub(); // Mock SweetAlert

      const mockCalDay = {
        allAppointments: [
          {
            time: '10:00',
            physician: 'Dr. García',
            patient: 'Juan Pérez',
            isCurrentPatient: true,
            status: 'confirmed',
          },
        ],
        dateString: '2025-07-15',
      };

      component.showDayDetails(mockCalDay);
      // SweetAlert would be called here
    });
  });

  describe('Navigation', () => {
    it('should navigate to patient dashboard', () => {
      component.goToPatientDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/patient-dashboard']);
    });
  });

  describe('User Information', () => {
    it('should get patient info correctly', () => {
      component.currentUser = mockCurrentUser;
      const patientInfo = component.getPatientInfo();
      expect(patientInfo).toBe('Juan Pérez');
    });

    it('should return default user when no current user', () => {
      component.currentUser = null;
      const patientInfo = component.getPatientInfo();
      expect(patientInfo).toBe('Usuario');
    });
  });

  describe('Form Reset', () => {
    it('should reset appointment form after successful submission', fakeAsync(() => {
      mockAdminService.createAppointment.and.returnValue(of({ id: 1 }));
      mockAdminService.getAllAppointments.and.returnValue(of([]));
      spyOn(window, 'alert').and.stub(); // Mock SweetAlert

      component.patientId = '1';
      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
      };

      component.submit();
      tick();

      expect(component.newAppt.physician_id).toBe('');
      expect(component.newAppt.date).toBe('');
      expect(component.newAppt.time).toBe('');
      expect(component.newAppt.specialty).toBe('');
      expect(component.newAppt.patient_id).toBe('1'); // Should maintain patient ID
    }));
  });

  describe('Edge Cases', () => {
    it('should handle empty physicians list', fakeAsync(() => {
      mockAuthService.getCurrentUser.and.returnValue(mockCurrentUser);
      mockPhysicianService.getAllPhysicians.and.returnValue(of([]));
      mockAdminService.getAllAppointments.and.returnValue(of([]));

      component.ngOnInit();
      tick();

      expect(component.allPhysicians.length).toBe(0);
      expect(component.specialtyCounts.length).toBe(0);
    }));

    it('should handle specialty change with empty specialty', () => {
      component.allPhysicians = [
        { id: 1, fullName: 'Dr. Test', specialty: 'Cardiología' },
      ];
      component.newAppt.specialty = '';

      component.onSpecialtyChange();

      expect(component.filteredPhysicians.length).toBe(1);
    });

    it('should handle appointment without patient ID', () => {
      spyOn(window, 'alert').and.stub(); // Mock SweetAlert

      component.patientId = '';
      component.newAppt = {
        patient_id: '',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
      };

      component.submit();

      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });
  });
});
