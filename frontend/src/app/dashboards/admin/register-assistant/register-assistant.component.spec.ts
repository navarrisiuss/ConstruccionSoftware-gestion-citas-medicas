import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

import { RegisterAssistantComponent } from './register-assistant.component';
import { AdminService } from '../../../services/admin.service';
import { Assistant } from '../../../models/assistant.model';

describe('RegisterAssistantComponent', () => {
  let component: RegisterAssistantComponent;
  let fixture: ComponentFixture<RegisterAssistantComponent>;
  let adminService: AdminService;

  beforeEach(async () => {
    const activatedRouteMock = {
      queryParams: of({
        edit: 'true',
        assistantId: '1',
        email: 'asistente@test.com'
      })
    };

    await TestBed.configureTestingModule({
      imports: [ RegisterAssistantComponent, HttpClientTestingModule ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    spyOn(Swal, 'fire').and.resolveTo();

    fixture = TestBed.createComponent(RegisterAssistantComponent);
    component = fixture.componentInstance;
    
    adminService = TestBed.inject(AdminService);
    spyOn(adminService, 'getAssistantByEmail').and.returnValue(of([
      new Assistant('Asistente', 'Prueba', '', 'asistente@test.com', 'password')
    ]));

    fixture.detectChanges(); 
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});