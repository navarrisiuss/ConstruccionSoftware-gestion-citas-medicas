import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { RegisterPhysicianComponent } from './register-physician.component';
import { AdminService } from '../../../services/admin.service'; // 👈 Se usa AdminService
import { PatientService } from '../../../services/patient.service';
import { Physician } from '../../../models/physician.model';

describe('RegisterPhysicianComponent', () => {
  let component: RegisterPhysicianComponent;
  let fixture: ComponentFixture<RegisterPhysicianComponent>;
  let adminService: AdminService;
  let patientService: PatientService;

  beforeEach(async () => {
    // Mock para los parámetros de la ruta (queryParams)
    const activatedRouteMock = {
      queryParams: of({
        edit: 'true',
        physicianId: '1',
        email: 'test@test.com'
      })
    };

    await TestBed.configureTestingModule({
      imports: [ RegisterPhysicianComponent, HttpClientTestingModule ],
      providers: [
        // Proporciona el mock de ActivatedRoute
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        // Los servicios se inyectarán automáticamente si son providedIn: 'root'
      ]
    }).compileComponents();

    // Espía a Swal para evitar que se muestren pop-ups reales
    // Se hace antes de crear el componente para interceptar cualquier llamada
    spyOn(Swal, 'fire').and.resolveTo(); // Resuelve la promesa de Swal

    fixture = TestBed.createComponent(RegisterPhysicianComponent);
    component = fixture.componentInstance;
    
    // Inyecta los servicios reales que usaremos para espiar
    adminService = TestBed.inject(AdminService);
    patientService = TestBed.inject(PatientService);

    // Crea el espía para el método correcto: getPhysicianByEmail
    // Debe devolver un ARREGLO de médicos, como espera el componente
    spyOn(adminService, 'getPhysicianByEmail').and.returnValue(of([
      new Physician('Dr. Test', 'Prueba', 'Falso', 'test@test.com', 'pass', 'Cardiología')
    ]));

    // Ahora, al ejecutar detectChanges, ngOnInit llamará al spy correctamente
    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});