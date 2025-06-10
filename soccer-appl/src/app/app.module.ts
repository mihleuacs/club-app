import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { PlayerDashboardComponent } from './player-dashboard/player-dashboard.component';
import { CoachDashboardComponent } from './coach-dashboard/coach-dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PlayerDashboardComponent,
    CoachDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
