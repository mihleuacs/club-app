import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  role = '';
  constructor(private supabaseService: SupabaseService, private router: Router) {}

  async login() {
  const { data, error } = await this.supabaseService.signIn(this.email, this.password);
  if (error) {
    this.error = error.message;
  } else {
    const userId = data.user?.id;
    if (userId) {
      const profileRes = await this.supabaseService.getPlayerProfile(userId);
      if (profileRes.error) {
        this.error = profileRes.error.message;
      } else {
        const role = profileRes.data.role;
        if (role === 'admin') {
          this.router.navigate(['/coach-dashboard']);
        } else if (role === 'player') {
          this.router.navigate(['/player-dashboard']);
        } else {
          this.error = 'Unknown user role';
        }
      }
    }
  }
}
}