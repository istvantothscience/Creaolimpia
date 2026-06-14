import { useState, useEffect } from 'react';
import { BarChart, Users, Award, TrendingUp, Trophy } from 'lucide-react';
import { statisticsService } from '@/services/statisticsService';
import { IndividualLeaderboardRow, TeamLeaderboardRow } from '@/types/database';

export default function StatisticsPage() {
  const [topIndividuals, setTopIndividuals] = useState<IndividualLeaderboardRow[]>([]);
  const [topTeams, setTopTeams] = useState<TeamLeaderboardRow[]>([]);
  const [classPoints, setClassPoints] = useState<{class_name: string; total_points: number}[]>([]);
  const [activityPoints, setActivityPoints] = useState<{activity_name: string; total_points: number; entry_count: number}[]>([]);
  const [activeTeam, setActiveTeam] = useState<{ team_name: string; count: number } | null>(null);
  const [activeParticipant, setActiveParticipant] = useState<{ full_name: string; count: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      statisticsService.getTop10Individuals(),
      statisticsService.getTop10Teams(),
      statisticsService.getClassPoints(),
      statisticsService.getActivityPoints(),
      statisticsService.getMostActiveTeam(),
      statisticsService.getMostActiveParticipant()
    ])
    .then(([ind, tms, cls, act, at, ap]) => {
      setTopIndividuals(ind);
      setTopTeams(tms);
      setClassPoints(cls);
      setActivityPoints(act);
      setActiveTeam(at);
      setActiveParticipant(ap);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12 flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
        <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Statisztikák betöltése...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <BarChart className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Olimpia Statisztikák</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Az eredmények számokban
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kiemelt információk */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#FAF8F5] border border-crea-accent/30 p-6 flex flex-col items-center justify-center text-center">
            <Trophy className="w-8 h-8 text-crea-primary mb-2" />
            <span className="text-[10px] text-crea-muted font-bold tracking-widest uppercase mb-1">Vezető Csapat</span>
            <span className="text-xl font-display font-bold text-crea-text uppercase tracking-wide">
              {topTeams[0]?.team_name || '-'}
            </span>
            <span className="text-xs font-bold text-stone-500 mt-1">{topTeams[0]?.total_points || 0} Drachma</span>
          </div>

          <div className="bg-[#FAF8F5] border border-crea-accent/30 p-6 flex flex-col items-center justify-center text-center">
            <Award className="w-8 h-8 text-crea-primary mb-2" />
            <span className="text-[10px] text-crea-muted font-bold tracking-widest uppercase mb-1">Vezető Diák</span>
            <span className="text-xl font-display font-bold text-crea-text uppercase tracking-wide">
              {topIndividuals[0]?.full_name || '-'}
            </span>
            <span className="text-xs font-bold text-stone-500 mt-1">{topIndividuals[0]?.total_points || 0} Drachma</span>
          </div>

          <div className="bg-[#FAF8F5] border border-crea-accent/30 p-6 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-8 h-8 text-crea-primary mb-2" />
            <span className="text-[10px] text-crea-muted font-bold tracking-widest uppercase mb-1">Legaktívabb Csapat</span>
            <span className="text-xl font-display font-bold text-crea-text uppercase tracking-wide">
              {activeTeam?.team_name || '-'}
            </span>
            <span className="text-xs font-bold text-stone-500 mt-1">{activeTeam?.count || 0} Bejegyzés</span>
          </div>

          <div className="bg-[#FAF8F5] border border-crea-accent/30 p-6 flex flex-col items-center justify-center text-center">
            <Users className="w-8 h-8 text-crea-primary mb-2" />
            <span className="text-[10px] text-crea-muted font-bold tracking-widest uppercase mb-1">Legaktívabb Diák</span>
            <span className="text-xl font-display font-bold text-crea-text uppercase tracking-wide">
              {activeParticipant?.full_name || '-'}
            </span>
            <span className="text-xs font-bold text-stone-500 mt-1">{activeParticipant?.count || 0} Bejegyzés</span>
          </div>
        </div>

        {/* Top 10 Csapat */}
        <div className="bg-[#FDFBF7] border border-crea-accent/20 p-6">
          <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-4 pb-2 border-b border-crea-accent/20">
            Top 10 Csapat
          </h2>
          <div className="space-y-3">
            {topTeams.slice(0, 10).map((team, idx) => (
              <div key={team.team_id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-400 w-4">{idx + 1}.</span>
                  <span className="font-display uppercase tracking-wider font-semibold text-stone-700">{team.team_name}</span>
                </div>
                <span className="font-bold tabular-nums text-crea-primary">{team.total_points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 Diák */}
        <div className="bg-[#FDFBF7] border border-crea-accent/20 p-6">
          <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-4 pb-2 border-b border-crea-accent/20">
            Top 10 Egyéni Részvevő
          </h2>
          <div className="space-y-3">
            {topIndividuals.slice(0, 10).map((ind, idx) => (
              <div key={ind.participant_id} className="flex justify-between items-center text-sm">
                 <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-400 w-4">{idx + 1}.</span>
                  <div className="flex flex-col">
                    <span className="font-display uppercase tracking-wider font-semibold text-stone-700">{ind.full_name}</span>
                    <span className="text-[10px] text-stone-500 uppercase">{ind.team_name || 'Nincs csapat'}</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-crea-primary">{ind.total_points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Osztályok / Szakok */}
        <div className="bg-[#FDFBF7] border border-crea-accent/20 p-6">
          <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-4 pb-2 border-b border-crea-accent/20">
            Pontok Osztályonként
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {classPoints.map((cls, idx) => (
              <div key={cls.class_name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-400 w-4">{idx + 1}.</span>
                  <span className="font-display uppercase tracking-wider font-bold text-stone-600">{cls.class_name}</span>
                </div>
                <span className="font-bold tabular-nums text-crea-primary">{cls.total_points}</span>
              </div>
            ))}
            {classPoints.length === 0 && <div className="text-xs text-stone-500 uppercase">Nincs adat</div>}
          </div>
        </div>

        {/* Versenyszámok */}
        <div className="bg-[#FDFBF7] border border-crea-accent/20 p-6">
          <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-4 pb-2 border-b border-crea-accent/20">
            Pontok Versenyszámonként
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {activityPoints.map((act, idx) => (
              <div key={act.activity_name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-stone-400 w-4">{idx + 1}.</span>
                  <div className="flex flex-col">
                    <span className="font-display uppercase tracking-wider font-bold text-stone-600">{act.activity_name}</span>
                    <span className="text-[10px] text-stone-400 uppercase">{act.entry_count} bejegyzés</span>
                  </div>
                </div>
                <span className="font-bold tabular-nums text-crea-primary">{act.total_points}</span>
              </div>
            ))}
            {activityPoints.length === 0 && <div className="text-xs text-stone-500 uppercase">Nincs adat</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
