import { supabase } from '@/lib/supabase';
import { individualService } from './individualService';
import { teamService } from './teamService';
import { IndividualLeaderboardRow, TeamLeaderboardRow, IndividualScoreByActivityRow } from '@/types/database';

export const statisticsService = {
  async getTop10Individuals(): Promise<IndividualLeaderboardRow[]> {
    const data = await individualService.getIndividualLeaderboard();
    return data.slice(0, 10);
  },

  async getTop10Teams(): Promise<TeamLeaderboardRow[]> {
    const data = await teamService.getTeamLeaderboard();
    return data.slice(0, 10);
  },

  async getClassPoints(): Promise<{ class_name: string; total_points: number }[]> {
    const data = await individualService.getIndividualLeaderboard();
    const classMap = new Map<string, number>();
    
    for (const row of data) {
      if (!row.class_name) continue;
      const current = classMap.get(row.class_name) || 0;
      classMap.set(row.class_name, current + row.total_points);
    }

    const result = Array.from(classMap.entries()).map(([class_name, total_points]) => ({
      class_name,
      total_points
    }));

    return result.sort((a, b) => b.total_points - a.total_points);
  },

  async getActivityPoints(): Promise<{ activity_name: string; total_points: number; entry_count: number }[]> {
    const data = await individualService.getIndividualScoresByActivity();
    const actMap = new Map<string, { total: number; count: number }>();

    for (const row of data) {
      const current = actMap.get(row.activity_name) || { total: 0, count: 0 };
      actMap.set(row.activity_name, {
        total: current.total + row.total_points,
        count: current.count + row.entry_count
      });
    }

    const result = Array.from(actMap.entries()).map(([activity_name, stats]) => ({
      activity_name,
      total_points: stats.total,
      entry_count: stats.count
    }));

    return result.sort((a, b) => b.total_points - a.total_points);
  },
  
  async getMostActiveTeam(): Promise<{ team_name: string; count: number } | null> {
    const summary = await individualService.getTeamIndividualScoreSummary();
    if (summary.length === 0) return null;
    
    const sorted = [...summary].sort((a, b) => b.score_entries_count - a.score_entries_count);
    return { team_name: sorted[0].team_name || 'Ismeretlen', count: sorted[0].score_entries_count };
  },

  async getMostActiveParticipant(): Promise<{ full_name: string; count: number } | null> {
    const data = await individualService.getIndividualLeaderboard();
    if (data.length === 0) return null;
    
    const sorted = [...data].sort((a, b) => b.score_entries_count - a.score_entries_count);
    return { full_name: sorted[0].full_name, count: sorted[0].score_entries_count };
  }
};
