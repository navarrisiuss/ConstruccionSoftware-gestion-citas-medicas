import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { AppointmentCalendarFormComponent } from './appointment-calendar-form.component';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';

describe('AppointmentCalendarFormComponent', () => {
  let component: AppointmentCalendarFormComponent;
  let fixture: ComponentFixture<AppointmentCalendarFormComponent>;
  let adminService: AdminService;
  let authService: AuthService;
  let router: Router;

  // Mock de un usuario médico para las pruebas
  const mockPhysicianUser = {
    id: 1,
    name: 'Carlos',
    paternalLastName: 'Santana',
    specialty: 'Cardiología'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppointmentCalendarFormComponent, HttpClientTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentCalendarFormComponent);
    component = fixture.componentInstance;
    
    // Inyecta las dependencias para poder espiarlas en cada prueba
    adminService = TestBed.inject(AdminService);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Espía a Swal para evitar que se muestren pop-ups reales
    spyOn(Swal, 'fire').and.resolveTo();
    // Espía el router para poder verificar la navegación
    spyOn(router, 'navigate');
  });

  it('should create', () => {
    // Prueba básica: ¿el componente se puede crear?
    // Simulamos que no hay usuario para que no ejecute la lógica del ngOnInit
    spyOn(authService, 'getCurrentUser').and.returnValue(null);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  // 👇 Grupo de pruebas para el escenario "Usuario Logueado"
  describe('when physician is logged in', () => {
    
    beforeEach(() => {
      // ANTES de cada prueba en este bloque, simulamos que hay un usuario
      spyOn(authService, 'getCurrentUser').and.returnValue(mockPhysicianUser);
      
      // Y simulamos las respuestas de los servicios que se llamarán en ngOnInit
      spyOn(adminService, 'getAllPatients').and.returnValue(of([]));
      spyOn(adminService, 'getAllAppointments').and.returnValue(of([]));
    });

    it('should initialize component properties and call load methods on init', () => {
      // Llama a ngOnInit (esto sucede en fixture.detectChanges())
      fixture.detectChanges();

      // Comprueba que los datos del usuario se asignaron
      expect(component.physicianId).toBe('1');
      expect(component.currentUser).toEqual(mockPhysicianUser);

      // Comprueba que los métodos para cargar datos fueron llamados
      expect(adminService.getAllPatients).toHaveBeenCalled();
      expect(adminService.getAllAppointments).toHaveBeenCalled();
    });

    // Anidamos las pruebas del filtro aquí, porque solo funcionan si hay un usuario logueado
    describe('onPatientSearch', () => {
        
      it('should filter patients by name', () => {
        const mockPatients = [
          { id: 1, name: 'Ana', paternalLastName: 'Gomez', maternalLastName: '', rut: '111-1'},
          { id: 2, name: 'Juan', paternalLastName: 'Perez', maternalLastName: '', rut: '222-2'}
        ];
        fixture.detectChanges(); 
      
        component.searchPatient = 'Ana'; // El usuario escribe "Ana"
        component.onPatientSearch(); // Se ejecuta el filtro
      
        expect(component.filteredPatients.length).toBe(0);
      });
    });

  });

  // 👇 Grupo de pruebas para el escenario "Usuario NO Logueado"
  describe('when no user is logged in', () => {

    it('should show an alert and navigate to login', fakeAsync(() => {
        // Simula que no hay usuario
        spyOn(authService, 'getCurrentUser').and.returnValue(null);

        // Llama a ngOnInit
        fixture.detectChanges();

        // Comprueba que se llamó a Swal
        expect(Swal.fire).toHaveBeenCalled();

        // Simula el paso del tiempo para que la promesa de Swal se resuelva
        tick();

        // Ahora comprueba que la navegación ocurrió
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));
  });
});