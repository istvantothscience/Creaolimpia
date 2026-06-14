import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield } from 'lucide-react';
import { teamService } from '@/services/teamService';
import { TeamLeaderboardRow } from '@/types/database';

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamLeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    teamService.getTeamLeaderboard()
      .then(setTeams)
      .catch(err => {
        console.error(err);
        setError('Nem sikerült betölteni a csapatokat.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-12 flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
        <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Csapatok betöltése...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium max-w-4xl mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <Users className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Csapatok</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          A tíz dicső polisz
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {teams.map(team => (
          <Link 
            key={team.team_id} 
            to={`/teams/${team.team_id}`}
            className="group block bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_4px_15px_rgba(44,36,27,0.05)] hover:shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-6 sm:p-8 transition-all overflow-hidden"
          >
            <div 
              className="absolute top-0 right-0 w-24 h-24 bg-current opacity-5 rounded-bl-[100px] transform origin-top-right transition-transform group-hover:scale-110"
              style={{ color: team.color || '#CFA052' }}
            ></div>

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6" style={{ color: team.color || '#CFA052' }} />
                  <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-crea-text group-hover:text-crea-primary transition-colors">
                    {team.team_name}
                  </h2>
                </div>
                
                <span 
                  className="inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border"
                  style={{ 
                    borderColor: team.color || '#CFA052', 
                    color: team.color || '#CFA052',
                    backgroundColor: `${team.color || '#CFA052'}10`
                  }}
                >
                  {team.rank}. Helyezés
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-3xl font-display font-black text-crea-text tabular-nums block leading-none">
                  {team.total_points}
                </span>
                <span className="text-[10px] text-crea-muted uppercase tracking-widest font-bold">
                  Drachma
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-crea-accent/20 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[10px] text-crea-muted uppercase tracking-widest font-bold mb-1">Egyéni pontok</div>
                <div className="font-bold text-stone-600 tabular-nums">{team.team_individual_points}</div>
              </div>
              <div>
                <div className="text-[10px] text-crea-muted uppercase tracking-widest font-bold mb-1">Csapat pontok</div>
                <div className="font-bold text-stone-600 tabular-nums">{team.team_competition_points}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
