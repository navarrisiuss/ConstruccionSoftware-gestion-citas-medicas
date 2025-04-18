import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { LoginComponent } from '../pages/login/login.component';
import { AdminDashboardComponent } from '../dashboards/admin-dashboard/admin-dashboard.component';
import { PhysicianDashboardComponent } from '../dashboards/physician-dashboard/physician-dashboard.component';
import { AssistantDashboardComponent } from '../dashboards/assistant-dashboard/assistant-dashboard.component';
import { PatientDashboardComponent } from '../dashboards/patient-dashboard/patient-dashboard.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'physician-dashboard', component: PhysicianDashboardComponent },
  { path: 'assistant-dashboard', component: AssistantDashboardComponent },
  { path: 'patient-dashboard', component: PatientDashboardComponent },
];
