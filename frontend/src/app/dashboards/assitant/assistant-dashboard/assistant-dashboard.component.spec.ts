import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AssistantDashboardComponent } from './assistant-dashboard.component';

describe('AssistantDashboardComponent', () => {
  let component: AssistantDashboardComponent;
  let fixture: ComponentFixture<AssistantDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssistantDashboardComponent , HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssistantDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
