import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { Admin } from '../../../models/admin.model';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const createMockAdmin = (
  data: {
    name?: string;
    paternalLastName?: string;
    maternalLastName?: string;
    email?: string;
    password?: string;
    id?: string;
  } = {}
): Admin => {
  const name = data.name || 'Admin';
  const paternalLastName = data.paternalLastName || 'Test';
  const maternalLastName = data.maternalLastName || 'Usuario';
  const email = data.email || 'admin@test.com';
  const password = data.password || 'password123';

  const adminInstance = new Admin(
    name,
    paternalLastName,
    maternalLastName,
    email,
    password
  );

  if (data.id) {
    (adminInstance as any).id = data.id;
  } else {
    (adminInstance as any).id = 'admin ডিফল্টID';
  }

  return adminInstance;
};

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let mockAuthService: any;
  let mockRouter: any;

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
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería establecer currentUser si getCurrentUser devuelve una instancia de Admin', () => {
      const mockAdminUser = createMockAdmin({ name: 'SuperAdminNombre' });
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);

      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toBe(mockAdminUser);

      expect(component.currentUser?.getName()).toBe('SuperAdminNombre');
    });

    it('no debería establecer currentUser si getCurrentUser no devuelve una instancia de Admin', () => {
      const mockNonAdminUser = { name: 'NoSoyAdmin', role: 'patient' };
      mockAuthService.getCurrentUser.and.returnValue(mockNonAdminUser);

      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toBeNull();
    });

    it('no debería establecer currentUser si getCurrentUser devuelve null', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      fixture.detectChanges();

      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toBeNull();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      const mockAdminUser = createMockAdmin();
      mockAuthService.getCurrentUser.and.returnValue(mockAdminUser);
      fixture.detectChanges();
    });

    it('debería llamar a authService.logout()', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('debería navegar a "/login" después del logout', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('goToRegisterPhysician', () => {
    it('debería navegar a "/register-physician"', () => {
      component.goToRegisterPhysician();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/register-physician']);
    });
  });
});
