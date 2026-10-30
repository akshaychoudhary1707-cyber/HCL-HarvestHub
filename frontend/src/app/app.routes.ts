import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FarmsComponent } from './components/farms/farms.component';
import { CropPlansComponent } from './components/crop-plans/crop-plans.component';
import { CropsComponent } from './components/crops/crops.component';
import { CropRequirementsComponent } from './components/crop-requirements/crop-requirements.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

/**
 * HarvestHub SPA Application Routes
 * - Unauthenticated users can only access /login and /signup
 * - Authenticated users are guarded and can access Dashboard, Farms, Crop Plans, Crops, Crop Requirements
 */
export const routes: Routes = [
  // Authentication Routes
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'HarvestHub - Sign In'
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard],
    title: 'HarvestHub - Register'
  },

  // Protected Core Application Routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'HarvestHub - Dashboard'
  },
  {
    path: 'farms',
    component: FarmsComponent,
    canActivate: [authGuard],
    title: 'HarvestHub - My Farms'
  },
  {
    path: 'crop-plans',
    component: CropPlansComponent,
    canActivate: [authGuard],
    title: 'HarvestHub - Crop Plans'
  },
  {
    path: 'crops',
    component: CropsComponent,
    canActivate: [authGuard],
    title: 'HarvestHub - Crops Catalog'
  },
  {
    path: 'crop-requirements',
    component: CropRequirementsComponent,
    canActivate: [authGuard],
    title: 'HarvestHub - Crop Requirements'
  },

  // Fallbacks & Redirects
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
