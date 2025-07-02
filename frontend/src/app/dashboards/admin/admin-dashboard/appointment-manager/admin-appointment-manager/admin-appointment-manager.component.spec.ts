/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdminAppointmentManagerComponent } from './admin-appointment-manager.component';

describe('AdminAppointmentManagerComponent', () => {
  let component: AdminAppointmentManagerComponent;
  let fixture: ComponentFixture<AdminAppointmentManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAppointmentManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAppointmentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
