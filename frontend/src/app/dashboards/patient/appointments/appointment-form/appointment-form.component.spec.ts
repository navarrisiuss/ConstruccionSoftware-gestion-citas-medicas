import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  fakeAsync,
  tick,
  flush,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppointmentFormComponent } from './appointment-form.component';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { PhysicianService } from '../../../../services/physician.service';
import { Physician } from '../../../../models/physician.model';

// Mock SweetAlert2
const mockSwalGlobal = {
  fire: jasmine.createSpy('fire').and.returnValue({
    then: jasmine.createSpy('then').and.callFake((callback: any) => {
      if (callback) {
        callback({ isConfirmed: true });
      }
      return Promise.resolve({ isConfirmed: true });
    }),
  }),
};

describe('AppointmentFormComponent', () => {
  let component: AppointmentFormComponent;
  let fixture: ComponentFixture<AppointmentFormComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPhysicianService: jasmine.SpyObj<PhysicianService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSwal: any;

  const mockCurrentUser = {
    id: 1,
    name: 'Juan',
    paternalLastName: 'Pérez',
    maternalLastName: 'González',
    email: 'juan@test.com',
  };

  // ✅ Create proper Physician instances instead of plain objects
  const mockPhysicians = [
    new Physician(
      'María',
      'García',
      'López',
      'maria@hospital.com',
      'password123',
      'Cardiología'
    ),
    new Physician(
      'Carlos',
      'Rodríguez',
      'Silva',
      'carlos@hospital.com',
      'password123',
      'Neurología'
    ),
    new Physician(
      'Ana',
      'Martínez',
      'Castro',
      'ana@hospital.com',
      'password123',
      'Cardiología'
    ),
  ];

  // Add id property to the physicians (simulating backend response)
  (mockPhysicians[0] as any).id = 1;
  (mockPhysicians[1] as any).id = 2;
  (mockPhysicians[2] as any).id = 3;

  const mockAppointments = [
    {
      id: 1,
      date: '2025-07-15',
      time: '10:00',
      physician_name: 'Dr. María García',
      patient_name: 'Juan Pérez',
      patient_id: 1,
      physician_id: 1,
      status: 'confirmed',
      reason: 'Consulta general',
      specialty: 'Cardiología',
      priority: 'normal',
      notes: 'Sin observaciones',
    },
    {
      id: 2,
      date: '2025-07-15',
      time: '11:00',
      physician_name: 'Dr. Carlos Rodríguez',
      patient_name: 'Ana Silva',
      patient_id: 2,
      physician_id: 2,
      status: 'confirmed',
      reason: 'Chequeo neurológico',
      specialty: 'Neurología',
      priority: 'normal',
      notes: '',
    },
  ];

  beforeEach(waitForAsync(() => {
    mockAdminService = jasmine.createSpyObj('AdminService', [
      'getAllAppointments',
      'createAppointment',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockPhysicianService = jasmine.createSpyObj('PhysicianService', [
      'getAllPhysicians',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Override the global Swal in the test setup
    (window as any).Swal = mockSwalGlobal;
    mockSwal = mockSwalGlobal; // Assign to local variable for easier access

    TestBed.configureTestingModule({
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

    // Reset all mocks before each test
    mockAdminService.getAllAppointments.calls.reset();
    mockAdminService.createAppointment.calls.reset();
    mockAuthService.getCurrentUser.calls.reset();
    mockPhysicianService.getAllPhysicians.calls.reset();
    mockRouter.navigate.calls.reset();
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockSwalGlobal.fire.calls.reset();
  }));

  describe('Component Initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should redirect to login if no authenticated user', fakeAsync(() => {
      // Configure no authenticated user
      mockAuthService.getCurrentUser.and.returnValue(null);

      // Manually call ngOnInit to trigger the logic
      component.ngOnInit();

      // Process any pending operations
      tick();

      // Verify that Swal.fire was called with the correct parameters
      expect(mockSwal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          title: 'Sesión Expirada',
          text: 'Debe iniciar sesión para agendar citas',
          icon: 'warning',
          confirmButtonText: 'Ir a Login',
        })
      );

      // Verify the then callback was executed and navigation happened
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);

      flush();
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
      expect(component.allPhysicians[0].fullName).toBe('María García López');
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

      expect(component.allAppointments.length).toBe(2);
      expect(component.allAppointments[0].isCurrentPatient).toBe(true);
      expect(component.allAppointments[1].isCurrentPatient).toBe(false);
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
        reason: 'Consulta general',
        priority: 'normal',
        notes: 'Sin observaciones',
      };

      component.submit();
      tick();

      expect(mockAdminService.createAppointment).toHaveBeenCalled();
      expect(mockAdminService.getAllAppointments).toHaveBeenCalled();
    }));

    // ✅ Corregir validación de campos requeridos
    it('should validate required fields before submission', () => {
      component.newAppt = {
        patient_id: '1',
        physician_id: '',
        date: '',
        time: '',
        specialty: '',
        reason: '',
        priority: 'normal',
        notes: '',
      };

      component.submit();

      expect(mockSwal.fire).toHaveBeenCalledWith({
        title: 'Error',
        text: 'Por favor complete todos los campos',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });

    it('should reject past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      // ✅ IMPORTANT: Set up patientId before testing past date validation
      component.patientId = '1';
      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: pastDate.toISOString().split('T')[0],
        time: '10:00',
        specialty: 'Cardiología',
        reason: 'Consulta general',
        priority: 'normal',
        notes: '',
      };

      component.submit();

      expect(mockSwal.fire).toHaveBeenCalledWith({
        title: 'Error',
        text: 'No puede agendar citas en fechas pasadas',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });

    it('should handle appointment creation error', fakeAsync(() => {
      // Setup error response
      mockAdminService.createAppointment.and.returnValue(
        throwError(() => ({ status: 409 }))
      );

      // Setup component state
      component.patientId = '1';
      component.allAppointments = []; // No conflicting appointments for validation
      component.allPhysicians = [
        { id: 1, fullName: 'Dr. Test', specialty: 'Cardiología' },
      ];

      // Setup form data
      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
        reason: 'Consulta general',
        priority: 'normal',
        notes: '',
      };

      // Call submit method
      component.submit();

      // Process the error response
      tick();

      // Verify Swal.fire was called with error message
      expect(mockSwal.fire).toHaveBeenCalledWith({
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

      expect(mockSwal.fire).toHaveBeenCalled();
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

      component.patientId = '1';
      component.allAppointments = [];
      component.allPhysicians = [
        { id: 1, fullName: 'Dr. Test', specialty: 'Cardiología' },
      ];

      component.newAppt = {
        patient_id: '1',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
        reason: 'Consulta general',
        priority: 'normal',
        notes: '',
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
      component.patientId = '';
      component.newAppt = {
        patient_id: '',
        physician_id: '1',
        date: '2025-07-20',
        time: '10:00',
        specialty: 'Cardiología',
        reason: '',
        priority: 'normal',
        notes: '',
      };

      component.submit();

      expect(mockSwal.fire).toHaveBeenCalledWith({
        title: 'Error de Sesión',
        text: 'No se pudo identificar al paciente. Inicie sesión nuevamente.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      expect(mockAdminService.createAppointment).not.toHaveBeenCalled();
    });
  });
});
