import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crea-primary"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-crea-text tracking-tight">Összesített Ranglista</h1>
        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-2">A csapatok jelenlegi állása</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-6">
        <div className="flex justify-between items-end mb-4 px-2">
           <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-1">Helyezések</h2>
           <span className="text-[10px] bg-crea-primary text-white px-2 py-1 rounded-md font-bold">LIVE</span>
        </div>
        <ul className="space-y-2">
          {scores.map((score, index) => {
            const isTop3 = index < 3;
            
            return (
              <li 
                key={score.team_id}
                className={cn(
                  "flex items-center p-3 sm:p-4 rounded-2xl my-1 transition-all border",
                  index === 0 ? "bg-crea-primary/5 hover:bg-crea-primary/10 border-crea-primary/20" :
                  index === 1 ? "bg-stone-50 hover:bg-stone-100 border-stone-200" :
                  index === 2 ? "bg-crea-accent/5 hover:bg-crea-accent/10 border-crea-accent/20" :
                  "bg-white hover:bg-stone-50 border-transparent hover:border-stone-100"
                )}
              >
                <div className="flex-shrink-0 w-10 text-center flex justify-center items-center">
                  {index === 0 ? <Medal className="w-6 h-6 text-crea-gold" /> :
                   index === 1 ? <Medal className="w-6 h-6 text-stone-400" /> :
                   index === 2 ? <Medal className="w-6 h-6 text-crea-accent" /> :
                   <span className="text-lg font-bold text-stone-400">{index + 1}.</span>}
                </div>
                
                <div className="ml-3 sm:ml-4 flex-1 flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full mr-3 shadow-inner border-2 border-white"
                    style={{ backgroundColor: score.color || '#e2e8f0' }}
                  />
                  <div>
                    <h2 className={cn(
                      "text-base sm:text-lg font-bold truncate",
                      isTop3 ? "text-crea-text" : "text-stone-600"
                    )}>
                      {score.team_name}
                    </h2>
                  </div>
                </div>
                
                <div className="ml-4 flex items-center justify-end text-right">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-xl sm:text-2xl font-black text-crea-text tabular-nums tracking-tight">
                      {score.total_points}
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider hidden sm:inline">
                      Pont
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
          
          {scores.length === 0 && (
            <li className="p-8 text-center text-gray-500">
              Még nem születtek eredmények.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
