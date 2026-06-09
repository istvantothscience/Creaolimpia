import { supabase } from '@/lib/supabase';
import { 
  OlympiaParticipant, 
  IndividualActivity, 
  IndividualScoreEntryInput, 
  IndividualLeaderboardRow, 
  TeamIndividualScoreSummaryRow,
  IndividualScoreByActivityRow
} from '@/types/database';

export const individualService = {
  async getParticipants() {
    const { data, error } = await supabase
      .from('olympia_participants')
      .select('*')
      .order('class_name', { ascending: true })
      .order('full_name', { ascending: true });
      
    if (error) throw error;
    return data as OlympiaParticipant[];
  },

  async getIndividualActivities() {
    const { data, error } = await supabase
      .from('individual_activities')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
      
    if (error) throw error;
    return data as IndividualActivity[];
  },

  async getIndividualLeaderboard() {
    const { data, error } = await supabase
      .from('individual_leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .order('full_name', { ascending: true });
      
    if (error) throw error;
    return data as IndividualLeaderboardRow[];
  },

  async createIndividualScoreEntry(entry: IndividualScoreEntryInput) {
    const { data, error } = await supabase
      .from('individual_score_entries')
      .insert([entry])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  async updateParticipantTeam(participantId: string, teamId: string | null) {
    const { error } = await supabase
      .from('olympia_participants')
      .update({ 
        team_id: teamId,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);
      
    if (error) throw error;
  },

  async getTeamIndividualScoreSummary() {
    const { data, error } = await supabase
      .from('team_individual_score_summary')
      .select('*')
      .order('individual_points', { ascending: false });
      
    if (error) throw error;
    return data as TeamIndividualScoreSummaryRow[];
  },

  async getIndividualScoresByActivity() {
    const { data, error } = await supabase
      .from('individual_scores_by_activity')
      .select('*')
      .order('activity_name', { ascending: true })
      .order('total_points', { ascending: false });
      
    if (error) throw error;
    return data as IndividualScoreByActivityRow[];
  }
};
