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
import {ManagePatientsComponent} from '../dashboards/manage-patient/manage-patient.component';
import {ManagePhysicianComponent} from '../dashboards/admin/manage-phsycian/manage-phsycian.component';
import {ManageAssistantsComponent} from '../dashboards/admin/manage-assistan/manage-assistan.component';
import { AppointmentCalendarFormComponent } from '../dashboards/physician-dashboard/appointment-calendar-form/appointment-calendar-form/appointment-calendar-form.component';
import {HelpChatComponent} from '../pages/help-chat/help-chat.component';

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

  // Rutas para gestión de personal médico por admin
  {path: 'admin/manage-physicians', component: ManagePhysicianComponent},
  {path: 'admin/manage-assistants', component: ManageAssistantsComponent},

  // Rutas compartidas para gestión de pacientes
  {path: 'manage-patients', component: ManagePatientsComponent},
  {path: 'admin/manage-patients', component: ManagePatientsComponent},
  {path: 'assistant/manage-patients', component: ManagePatientsComponent},
  {path: 'physician/manage-patients', component: ManagePatientsComponent},

  // Otras rutas...
  {path: 'manage-appointments', component: AdminDashboardComponent},
  {path: 'medical-history', component: AdminDashboardComponent},
  {path: 'medical-schedule', component: AdminDashboardComponent},
  {path: 'reports', component: AdminDashboardComponent},

  // Rutas para asistente
  {path: 'assistant-manage-appointments', component: AssistantDashboardComponent},
  {path: 'assistant-schedule-appointment', component: AssistantDashboardComponent},
  {path: 'assistant-reports', component: AssistantDashboardComponent},

  // Rutas para médico
  {path: 'physician-schedule', component: AppointmentCalendarFormComponent},
  {path: 'physician-patients', component: PhysicianDashboardComponent},
  {path: 'physician-medical-history', component: PhysicianDashboardComponent},


  // Rutas para paciente
  {path: 'patient-appointment-history', component: PatientDashboardComponent},
  {path: 'patient-help-chat', component: HelpChatComponent}
];
