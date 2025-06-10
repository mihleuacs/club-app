import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/supabase.service';

@Component({
  selector: 'app-player-dashboard',
  templateUrl: './player-dashboard.component.html',
  styleUrls: ['./player-dashboard.component.css']
})
export class PlayerDashboardComponent implements OnInit {
  trainingSessions: any[] = [];
  runningDistance: number | null = null;
  runningTime: string = '';
  
  allRunningRecords: any[] = []; // store all runs here
  runningRecords: any[] = [];    // what you bind in the template

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchTrainingSessions();
    this.fetchRunningRecords();
  }

  

  async fetchTrainingSessions() {
    const { data, error } = await this.supabaseService.supabase
      .from('training_sessions')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching sessions:', error);
      return;
    }

    const today = new Date();
    this.trainingSessions = data.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= today;
    });
  }

  async fetchRunningRecords() {
    const user = await this.supabaseService.getCurrentUser();
    if (!user) {
      console.warn('User not authenticated');
      return;
    }

    const { data, error } = await this.supabaseService.supabase
      .from('running_records')
      .select('*')
      .eq('player_id', user.id)
      .order('created_at', { ascending: false }); // newest first

    if (error) {
      console.error('Error fetching running records:', error);
      return;
    }

    this.allRunningRecords = data || [];

    // After reload, show last 5 runs only
    this.runningRecords = this.allRunningRecords.slice(0, 5);
  }

  async addRunningRecord(runForm: any) {
    if (this.runningDistance !== null && this.runningTime.trim()) {
      try {
        const user = await this.supabaseService.getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await this.supabaseService.supabase
          .from('running_records')
          .insert({
            player_id: user.id,
            distance_km: this.runningDistance,
            time: this.runningTime,
          })
          .select();

        if (error) throw error;

        if (Array.isArray(data) && data.length > 0) {
        this.runningRecords = [data[0], ...this.runningRecords].slice(0, 5);
        runForm.resetForm();
        this.runningDistance = null;
        this.runningTime = '';
} else {
          console.warn('No data returned after insert');
        }
      } catch (err) {
        console.error('Failed to add running record:', err);
      }
    }
  }

  logout() {
    this.supabaseService.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout error:', err));
  }
}
