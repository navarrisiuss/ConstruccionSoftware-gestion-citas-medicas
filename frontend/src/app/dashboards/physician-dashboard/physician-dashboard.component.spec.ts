import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PhysicianDashboardComponent } from './physician-dashboard.component';

describe('PhysicianDashboardComponent', () => {
  let component: PhysicianDashboardComponent;
  let fixture: ComponentFixture<PhysicianDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhysicianDashboardComponent , HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhysicianDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
