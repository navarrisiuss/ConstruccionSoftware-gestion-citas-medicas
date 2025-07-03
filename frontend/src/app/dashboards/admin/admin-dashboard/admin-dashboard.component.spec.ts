import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { Admin } from '../../../models/admin.model';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const createMockAdmin = (overrides: any = {}): Admin => {
    const adminInstance = new Admin(
      overrides.name || 'Admin',
      overrides.paternalLastName || 'Test',
      overrides.maternalLastName || 'Usuario',
      overrides.email || 'admin@test.com',
      overrides.password || 'password123'
    );
    if (overrides.id) {
      (adminInstance as any).id = overrides.id;
    } else {
      (adminInstance as any).id = 'admin-default-id';
    }
    return adminInstance;
  };

  beforeEach(waitForAsync(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'logout',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AdminDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    component.currentUser = null;
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set currentUser when getCurrentUser returns an Admin instance', () => {
      const mockAdminUser = createMockAdmin({ name: 'SuperAdminNombre' });
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);

      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).not.toBeNull();
      expect(component.currentUser instanceof Admin).toBeTrue();
      expect((component.currentUser as Admin).getName()).toEqual(
        'SuperAdminNombre'
      );
    });

    it('should convert plain object to Admin instance when needed', () => {
      const mockUserObject = {
        name: 'NoSoyAdmin',
        paternalLastName: 'Apellido',
        maternalLastName: 'Materno',
        email: 'test@test.com',
        password: 'pass123',
      };
      mockAuthService.getCurrentUser.and.returnValue(mockUserObject);

      fixture.detectChanges();

      expect(component.currentUser).not.toBeNull();
      expect(component.currentUser instanceof Admin).toBeTrue();
      expect((component.currentUser as Admin).getName()).toEqual('NoSoyAdmin');
    });

    it('should not set currentUser when getCurrentUser returns null', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(component.currentUser).toBeNull();
    });
  });

  describe('Authentication', () => {
    beforeEach(() => {
      const mockAdminUser = createMockAdmin();
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);
      fixture.detectChanges();
    });

    it('should logout and navigate to login', () => {
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Navigation Methods', () => {
    const navigationTests = [
      { method: 'goToRegisterPhysician', route: '/register-physician' },
      { method: 'goToRegisterAssistant', route: '/register-assistant' },
      { method: 'goToManagePatients', route: '/manage-patients' },
      { method: 'goToManageAppointments', route: '/manage-appointments' },
      { method: 'goToMedicalHistory', route: '/medical-history' },
      { method: 'goToMedicalSchedule', route: '/medical-schedule' },
      { method: 'goToReports', route: '/reports' },
      { method: 'goToPhysiciansView', route: '/physicians-view' },
      { method: 'goToAssistantsView', route: '/assistants-view' },
    ];

    navigationTests.forEach(({ method, route }) => {
      it(`${method} should navigate to ${route}`, () => {
        (component as any)[method]();
        expect(mockRouter.navigate).toHaveBeenCalledWith([route]);
      });
    });
  });
});
