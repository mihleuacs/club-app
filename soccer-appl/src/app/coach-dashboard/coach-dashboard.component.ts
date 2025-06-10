import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/supabase.service';

@Component({
  selector: 'app-coach-dashboard',
  templateUrl: './coach-dashboard.component.html',
  styleUrls: ['./coach-dashboard.component.css']
})
export class CoachDashboardComponent implements OnInit {
  trainingSessions: any[] = [];
  newSession = {
    title: '',
    date: '',
    time: '',
    description: ''
  };
  runningStats: any[] = [];
  leaderboard: any[] = [];
  filterDate: string = '';
  searchName: string = '';
  sortByQuickest: boolean = false;

  constructor(private supabaseService: SupabaseService ,  private router: Router) {}

  ngOnInit() {
    this.fetchTrainingSessions();
    this.fetchRunningStats();
    this.fetchLeaderboard();
  }

  async fetchTrainingSessions() {
    const { data, error } = await this.supabaseService.supabase
      .from('training_sessions')
      .select('*')
      .order('date', { ascending: false });

    if (!error) this.trainingSessions = data;
  }

  async createSession() {
    const user = await this.supabaseService.getCurrentUser();
    const { data, error } = await this.supabaseService.supabase
      .from('training_sessions')
      .insert({
        ...this.newSession,
        created_by: user?.id,
        created_at: new Date().toISOString()
      });
    if (!error) {
      this.fetchTrainingSessions();
      this.newSession = { title: '', date: '', time: '', description: '' };
    }
  }

  async deleteSession(id: string) {
    await this.supabaseService.supabase.from('training_sessions').delete().eq('id', id);
    this.fetchTrainingSessions();
  }

  async fetchRunningStats() {
    // This query now expects a direct foreign key: running_records.player_id -> profiles.id
    let query = this.supabaseService.supabase
      .from('running_records')
      .select('*, profile:profiles(full_name)');

    if (this.filterDate) {
      const start = new Date(this.filterDate);
      const end = new Date(this.filterDate);
      end.setHours(23, 59, 59, 999);
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString());
    }

    const { data, error } = await query;

    if (!error) {
      this.runningStats = data.filter((r: any) =>
        r.profile?.full_name?.toLowerCase().includes(this.searchName.toLowerCase())
      );

      if (this.sortByQuickest) {
        this.runningStats.sort((a, b) => a.time.localeCompare(b.time));
      }
    } else {
      console.error('Error fetching running stats:', error);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
    }
  }

  async fetchLeaderboard() {
    const { data, error } = await this.supabaseService.supabase
      .from('running_records')
      .select('player_id, distance_km, profile:profiles(full_name)'); // Corrected 'prfofile' to 'profile'

    if (!error) {
      const totals: { [key: string]: { name: string; total: number } } = {};
      data.forEach((r: any) => {
        if (!totals[r.player_id]) {
          // Corrected 'r.player.full_name' to 'r.profile.full_name'
          totals[r.player_id] = { name: r.profile.full_name, total: 0 };
        }
        totals[r.player_id].total += r.distance_km;
      });
      this.leaderboard = Object.values(totals).sort((a, b) => b.total - a.total);
    } else {
      console.error('Error fetching leaderboard:', error);
    }
  }

  onFilterChange() {
    this.fetchRunningStats();
  }


  logout() {
    this.supabaseService.signOut()
      .then(() => this.router.navigate(['/login']))
      .catch(err => console.error('Logout error:', err));
  }
}

