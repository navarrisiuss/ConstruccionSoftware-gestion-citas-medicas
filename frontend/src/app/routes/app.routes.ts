import {Routes} from '@angular/router';
import {HomeComponent} from '../pages/home/home.component';
import {LoginComponent} from '../pages/auth/login/login.component';
import {AdminDashboardComponent} from '../dashboards/admin/admin-dashboard/admin-dashboard.component';
import {PhysicianDashboardComponent} from '../dashboards/physician-dashboard/physician-dashboard.component';
import {AssistantDashboardComponent} from '../dashboards/assitant/assistant-dashboard/assistant-dashboard.component';
import {PatientDashboardComponent} from '../dashboards/patient/patient-dashboard/patient-dashboard.component';
import {RegisterPhysicianComponent} from '../dashboards/admin/register-physician/register-physician.component';
import {RegisterAssistantComponent} from '../dashboards/admin/register-assistant/register-assistant.component';
import {RegisterPatientComponent} from '../dashboards/assitant/register-patient/register-patient.component';
import {RegisterComponent} from '../pages/auth/register/register.component';
import {AppointmentFormComponent} from '../dashboards/patient/appointments/appointment-form/appointment-form.component';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'admin-dashboard', component: AdminDashboardComponent},
  {path: 'physician-dashboard', component: PhysicianDashboardComponent},
  {path: 'assistant-dashboard', component: AssistantDashboardComponent},
  {path: 'patient-dashboard', component: PatientDashboardComponent},
  {path: 'register-physician', component: RegisterPhysicianComponent},
  {path: 'register-assistant', component: RegisterAssistantComponent},
  {path: 'register-patient', component: RegisterPatientComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'appointment-form', component: AppointmentFormComponent},
  
  // Rutas para admin
  {path: 'manage-patients', component: AdminDashboardComponent},
  {path: 'manage-appointments', component: AdminDashboardComponent},
  {path: 'medical-history', component: AdminDashboardComponent},
  {path: 'medical-schedule', component: AdminDashboardComponent},
  {path: 'reports', component: AdminDashboardComponent},
  {path: 'physicians-view', component: AdminDashboardComponent},
  {path: 'assistants-view', component: AdminDashboardComponent},
  
  // Rutas para asistente
  {path: 'assistant-manage-patients', component: AssistantDashboardComponent},
  {path: 'assistant-manage-appointments', component: AssistantDashboardComponent},
  {path: 'assistant-schedule-appointment', component: AssistantDashboardComponent},
  {path: 'assistant-reports', component: AssistantDashboardComponent},
  
  // Rutas para médico
  {path: 'physician-schedule', component: PhysicianDashboardComponent},
  {path: 'physician-patients', component: PhysicianDashboardComponent},
  {path: 'physician-medical-history', component: PhysicianDashboardComponent},
  
  // Nuevas rutas para paciente
  {path: 'patient-appointment-history', component: PatientDashboardComponent},
  {path: 'patient-help-chat', component: PatientDashboardComponent}
];