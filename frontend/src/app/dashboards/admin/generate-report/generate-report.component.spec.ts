import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { GenerateReportComponent } from './generate-report.component';

describe('GenerateReportComponent', () => {
  let component: GenerateReportComponent;
  let fixture: ComponentFixture<GenerateReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateReportComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
