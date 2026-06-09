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

export type WeeklyProgramEvent = {
  id: string;
  camp_name: string;
  program_date: string;
  day_name: string;
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  time_label: string | null;
  title: string;
  description: string | null;
  coordinator: string | null;
  location: string | null;
  event_type: string;
  is_scoreable: boolean;
  scoring_mode: string;
  activity_name: string | null;
  activity_category: string | null;
  default_points: number | null;
  max_points: number | null;
  is_visible_to_teams: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProgramScoreEntryInput = {
  program_event_id: string;
  team_id: string;
  student_name?: string | null;
  points: number;
  note?: string | null;
  metric_label?: string | null;
  metric_value?: number | null;
  created_by?: string | null;
};
