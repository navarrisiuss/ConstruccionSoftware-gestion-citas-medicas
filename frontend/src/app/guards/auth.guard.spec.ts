import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', [
      'getCurrentUser',
      'getUserRole',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    mockAuthService = TestBed.inject(
      AuthService
    ) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockRoute = {
      data: {},
    } as ActivatedRouteSnapshot;

    mockState = {} as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('canActivate', () => {
    it('should allow access when user exists and no role restrictions', () => {
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'test@test.com',
        role: 'admin',
      });

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should deny access and redirect to login when no user', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should check roles when specified in route data', () => {
      mockRoute.data = { roles: ['admin', 'physician'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'admin@test.com',
        role: 'admin',
      });
      mockAuthService.getUserRole.and.returnValue('admin');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
      expect(mockAuthService.getUserRole).toHaveBeenCalled();
    });

    it('should deny access when user role not in allowed roles', () => {
      mockRoute.data = { roles: ['admin', 'physician'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'patient@test.com',
        role: 'patient',
      });
      mockAuthService.getUserRole.and.returnValue('patient');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });
  });

  describe('Role-based Access Control', () => {
    it('should allow admin access to admin routes', () => {
      mockRoute.data = { roles: ['admin'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'admin@test.com',
        role: 'admin',
      });
      mockAuthService.getUserRole.and.returnValue('admin');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('should allow physician access to physician routes', () => {
      mockRoute.data = { roles: ['physician'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'doctor@test.com',
        specialty: 'cardiology',
      });
      mockAuthService.getUserRole.and.returnValue('physician');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('should allow multiple roles access', () => {
      mockRoute.data = { roles: ['admin', 'physician'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'doctor@test.com',
        specialty: 'cardiology',
      });
      mockAuthService.getUserRole.and.returnValue('physician');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(true);
    });

    it('should deny access when user has no role', () => {
      mockRoute.data = { roles: ['admin'] };
      mockAuthService.getCurrentUser.and.returnValue({
        email: 'test@test.com',
      });
      mockAuthService.getUserRole.and.returnValue('');

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/unauthorized']);
    });

    it('should redirect to login when no user for role-protected route', () => {
      mockRoute.data = { roles: ['admin'] };
      mockAuthService.getCurrentUser.and.returnValue(null);

      const result = guard.canActivate(mockRoute, mockState);

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
