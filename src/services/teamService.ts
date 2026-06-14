import { supabase } from '@/lib/supabase';
import { Team, TeamWithMembers, TeamLeaderboardRow, OlympiaParticipant } from '@/types/database';
import { individualService } from './individualService';

export const teamService = {
  async getTeamLeaderboard(): Promise<TeamLeaderboardRow[]> {
    const [teamsRes, pointsRes, individualPointsRes] = await Promise.all([
      supabase.from('teams').select('*'),
      supabase.from('team_points').select('team_id, points'),
      individualService.getTeamIndividualScoreSummary()
    ]);

    if (teamsRes.error) throw teamsRes.error;
    if (pointsRes.error) throw pointsRes.error;

    const teams = teamsRes.data || [];
    const teamPointsData = pointsRes.data || [];
    const individualPointsData = individualPointsRes || [];

    const leaderboard: TeamLeaderboardRow[] = teams.map(team => {
      const teamPoints = teamPointsData
        .filter(p => p.team_id === team.id)
        .reduce((sum, p) => sum + p.points, 0);

      const indPointsRow = individualPointsData.find(row => row.team_id === team.id);
      const indPoints = indPointsRow ? indPointsRow.individual_points : 0;

      return {
        team_id: team.id,
        team_name: team.name,
        color: team.color,
        team_competition_points: teamPoints,
        team_individual_points: indPoints,
        total_points: teamPoints + indPoints,
      };
    });

    leaderboard.sort((a, b) => b.total_points - a.total_points);
    
    // Assign rank
    leaderboard.forEach((item, index) => {
      item.rank = index + 1;
    });

    return leaderboard;
  },

  async getTeamsWithMembers(): Promise<TeamWithMembers[]> {
    const [leaderboard, participantsRes] = await Promise.all([
      this.getTeamLeaderboard(),
      supabase.from('olympia_participants').select('*').order('team_position', { ascending: true })
    ]);

    if (participantsRes.error) throw participantsRes.error;
    const allParticipants = participantsRes.data as OlympiaParticipant[];

    return leaderboard.map(lb => ({
      team: { id: lb.team_id, name: lb.team_name, color: lb.color },
      members: allParticipants.filter(p => p.team_id === lb.team_id),
      individualPoints: lb.team_individual_points,
      teamPoints: lb.team_competition_points,
      totalPoints: lb.total_points,
      rank: lb.rank
    }));
  },

  async getTeamMembers(teamId: string): Promise<OlympiaParticipant[]> {
    const { data, error } = await supabase
      .from('olympia_participants')
      .select('*')
      .eq('team_id', teamId)
      .order('team_position', { ascending: true })
      .order('full_name', { ascending: true });
      
    if (error) throw error;
    return data as OlympiaParticipant[];
  }
};
