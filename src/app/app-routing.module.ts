import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { TrackerComponent } from './tracker/tracker.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { NotFoundComponent } from './utils/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { LoginGuard } from './shared/guards/login.guard';

const appRoutes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'tracker', component: TrackerComponent },
      { path: 'profile', component: ProfileComponent },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
