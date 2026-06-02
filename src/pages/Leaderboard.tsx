import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Crown, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankItem {
  team_id: string;
  team_name: string;
  color: string;
  total_points: number;
}

export default function Leaderboard() {
  const [scores, setScores] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScores();

    if (!supabase) return;

    // Optional: Realtime subscription for points if needed
    const subscription = supabase
      .channel('points_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_points' }, () => {
        fetchScores();
      })
      .subscribe((status, err) => {
        if (err) console.warn('Realtime hiba:', err);
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchScores = async () => {
    if (!supabase) return;
    try {
      const [teamsRes, pointsRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('team_points').select('team_id, points')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (pointsRes.error) throw pointsRes.error;

      if (teamsRes.data && pointsRes.data) {
        const aggregated: RankItem[] = teamsRes.data.map(team => {
          const teamPoints = pointsRes.data
            .filter(p => p.team_id === team.id)
            .reduce((sum, p) => sum + p.points, 0);
            
          return {
            team_id: team.id,
            team_name: team.name,
            color: team.color,
            total_points: teamPoints,
          };
        });

        aggregated.sort((a, b) => b.total_points - a.total_points);
        setScores(aggregated);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crea-accent"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <Landmark className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Ranglista</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Dicsőségtábla
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-8 sm:p-10">
        <div className="flex justify-between items-end mb-6 px-2">
           <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-1">Poliszok Állása</h2>
           <span className="text-[10px] bg-crea-primary text-crea-bg border border-crea-bg px-3 py-1 uppercase tracking-widest shadow-sm">Élő</span>
        </div>
        <ul className="space-y-4 relative z-10">
          {scores.map((score, index) => {
            const isTop3 = index < 3;
            
            return (
              <li 
                key={score.team_id}
                className={cn(
                  "flex items-center p-4 sm:p-5 transition-all border relative overflow-hidden group",
                  index === 0 ? "bg-[#FDFBF7] border-crea-accent shadow-[0_4px_15px_rgba(207,160,82,0.15)]" :
                  index === 1 ? "bg-stone-50 border-stone-300" :
                  index === 2 ? "bg-crea-accent/5 border-[#B17A44]/30" :
                  "bg-white border-transparent hover:border-crea-accent/20 border-b-crea-muted/10"
                )}
              >
                {/* Decorative background element for #1 */}
                {index === 0 && (
                  <div className="absolute -right-4 -bottom-4 opacity-5 text-crea-accent rotate-12 group-hover:scale-110 transition-transform duration-700">
                    <Crown className="w-32 h-32" />
                  </div>
                )}

                <div className="flex-shrink-0 w-12 text-center flex justify-center items-center relative z-10">
                  {index === 0 ? <Crown className="w-8 h-8 text-crea-accent" /> :
                   index === 1 ? <Crown className="w-7 h-7 text-stone-400" /> :
                   index === 2 ? <Crown className="w-7 h-7 text-[#B17A44]" /> :
                   <span className="text-lg font-display font-black text-crea-muted">{index + 1}.</span>}
                </div>
                
                <div className="ml-4 sm:ml-6 flex-1 flex items-center relative z-10">
                  <div 
                    className="w-4 h-12 mr-4 shadow-sm border border-black/10"
                    style={{ backgroundColor: score.color || '#e2e8f0' }}
                  />
                  <div>
                    <h2 className={cn(
                      "text-xl sm:text-2xl font-display font-medium tracking-wide uppercase",
                      isTop3 ? "text-crea-text" : "text-stone-600"
                    )}>
                      {score.team_name}
                    </h2>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center justify-end text-right relative z-10">
                  <div className="flex flex-col items-end">
                    <span className="text-2xl sm:text-4xl font-display font-black text-crea-primary tabular-nums">
                      {score.total_points}
                    </span>
                    <span className="text-[10px] font-bold text-crea-muted uppercase tracking-[0.2em] mt-1">
                      Drachma
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          
          {scores.length === 0 && (
            <li className="p-12 text-center text-crea-muted font-display tracking-widest uppercase">
              Még nincsenek eredmények.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
