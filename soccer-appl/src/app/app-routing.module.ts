import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard.component';
import { CoachDashboardComponent } from './coach-dashboard/coach-dashboard.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
   { path: 'login', component: LoginComponent },
   { path: 'player-dashboard', component: PlayerDashboardComponent },
   { path: 'coach-dashboard', component: CoachDashboardComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
