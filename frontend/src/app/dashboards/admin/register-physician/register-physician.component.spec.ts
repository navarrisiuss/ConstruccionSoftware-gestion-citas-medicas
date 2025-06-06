import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPhysicianComponent } from './register-physician.component';

describe('RegisterPhysicianComponent', () => {
  let component: RegisterPhysicianComponent;
  let fixture: ComponentFixture<RegisterPhysicianComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPhysicianComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPhysicianComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
