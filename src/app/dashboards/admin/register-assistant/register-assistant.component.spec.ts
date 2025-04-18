import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterAssistantComponent } from './register-assistant.component';

describe('RegisterAssistantComponent', () => {
  let component: RegisterAssistantComponent;
  let fixture: ComponentFixture<RegisterAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
