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

export type OlympiaParticipant = {
  id: string;
  full_name: string;
  class_name: string | null;
  participant_order: number | null;
  team_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type IndividualActivity = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  scoring_type: string;
  default_points: number | null;
  max_points: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type IndividualScoreEntryInput = {
  participant_id: string;
  activity_id: string;
  points: number;
  placement?: number | null;
  metric_label?: string | null;
  metric_value?: number | null;
  note?: string | null;
  score_date?: string;
  created_by?: string | null;
};

export type IndividualLeaderboardRow = {
  participant_id: string;
  full_name: string;
  class_name: string | null;
  team_id: string | null;
  team_name: string | null;
  total_points: number;
  score_entries_count: number;
  rank: number;
};

export type TeamIndividualScoreSummaryRow = {
  team_id: string | null;
  team_name: string | null;
  individual_points: number;
  participants_with_team: number;
  score_entries_count: number;
};

export type TeamWithMembers = {
  team: Team;
  members: OlympiaParticipant[];
  individualPoints: number;
  teamPoints: number;
  totalPoints: number;
  rank?: number;
};

export type TeamLeaderboardRow = {
  team_id: string;
  team_name: string;
  color: string;
  team_competition_points: number;
  team_individual_points: number;
  total_points: number;
  rank?: number;
};

export type IndividualScoreByActivityRow = {
  activity_id: string;
  activity_name: string;
  participant_id: string;
  full_name: string;
  class_name: string | null;
  team_id: string | null;
  team_name: string | null;
  total_points: number;
  best_recorded_placement: number | null;
  entry_count: number;
};
