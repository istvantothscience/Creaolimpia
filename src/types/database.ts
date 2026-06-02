export type Role = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
  team_id?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface TeamPoint {
  id: string;
  team_id: string;
  camp_day: number;
  points: number;
  note?: string;
  entered_by?: string;
  created_at: string;
}

export interface WeeklyProgram {
  id: string;
  day_number: number;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
  location?: string;
}
