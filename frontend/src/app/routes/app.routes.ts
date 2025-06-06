import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { LoginComponent } from '../pages/auth/login/login.component';
import { AdminDashboardComponent } from '../dashboards/admin/admin-dashboard/admin-dashboard.component';
import { PhysicianDashboardComponent } from '../dashboards/physician-dashboard/physician-dashboard.component';
import { AssistantDashboardComponent } from '../dashboards/assitant/assistant-dashboard/assistant-dashboard.component';
import { PatientDashboardComponent } from '../dashboards/patient/patient-dashboard/patient-dashboard.component';
import { RegisterPhysicianComponent } from '../dashboards/admin/register-physician/register-physician.component';
import { RegisterPatientComponent } from '../dashboards/assitant/register-patient/register-patient.component';
import { RegisterComponent } from '../pages/auth/register/register.component';
import { AppointmentFormComponent } from '../dashboards/patient/appointments/appointment-form/appointment-form.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'physician-dashboard', component: PhysicianDashboardComponent },
  { path: 'assistant-dashboard', component: AssistantDashboardComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent },
  { path: 'register-physician', component: RegisterPhysicianComponent },
  { path: 'register-patient', component: RegisterPatientComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'appointment-form', component: AppointmentFormComponent },
];
