import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { User, Crown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { 
  IndividualLeaderboardRow, 
  IndividualScoreByActivityRow,
  Team
} from '@/types/database';
import { individualService } from '@/services/individualService';

export default function IndividualLeaderboardPage() {
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<IndividualLeaderboardRow[]>([]);
  const [activityLeaderboard, setActivityLeaderboard] = useState<IndividualScoreByActivityRow[]>([]);
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overall' | 'activities'>('overall');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: teamsData } = await supabase.from('teams').select('*');
      const teamsMap: Record<string, Team> = {};
      if (teamsData) {
         teamsData.forEach(t => teamsMap[t.id] = t);
      }
      setTeams(teamsMap);

      if (activeTab === 'overall') {
        const data = await individualService.getIndividualLeaderboard();
        setLeaderboard(data);
      } else {
        const data = await individualService.getIndividualScoresByActivity();
        setActivityLeaderboard(data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Nem sikerült betölteni az egyéni rangsort.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter(item => {
    if (search && !item.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== 'all' && item.class_name !== filterClass) return false;
    if (filterTeam !== 'all' && item.team_id !== filterTeam) return false;
    return true;
  });

  const filteredActivities = activityLeaderboard.filter(item => {
    if (search && !item.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== 'all' && item.class_name !== filterClass) return false;
    if (filterTeam !== 'all' && item.team_id !== filterTeam) return false;
    return true;
  });

  const uniqueClasses = Array.from(new Set(leaderboard.map(i => i.class_name).filter(Boolean))) as string[];
  const teamOptions = Object.values(teams);

  const renderBadge = (index: number) => {
    if (index === 0) return <Crown className="w-8 h-8 text-crea-accent" />;
    if (index === 1) return <Crown className="w-7 h-7 text-stone-400" />;
    if (index === 2) return <Crown className="w-7 h-7 text-[#B17A44]" />;
    return <span className="text-lg font-display font-black text-crea-muted">{index + 1}.</span>;
  };

  const renderTeamBadge = (teamId: string | null, teamName: string | null) => {
    if (!teamId) {
      return (
        <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 border border-stone-200 uppercase tracking-widest font-bold">
          Nincs csapathoz rendelve
        </span>
      );
    }
    const team = teams[teamId];
    const color = team?.color || '#CFA052';
    
    return (
       <span 
         className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 border uppercase tracking-widest font-bold truncate max-w-[140px]"
         style={{ borderColor: color, color: color, backgroundColor: `${color}10` }}
       >
         <Shield className="w-3 h-3" style={{ color }} />
         {teamName}
       </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <User className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Egyéni rangsor</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Az egyéni versenyszámok bajnokai
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="flex justify-center border-b border-crea-accent/20 mb-8 w-full max-w-sm mx-auto">
        <button
          onClick={() => setActiveTab('overall')}
          className={cn(
            "flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative",
            activeTab === 'overall' ? "text-crea-primary" : "text-crea-muted hover:text-crea-text"
          )}
        >
          Összesített
          {activeTab === 'overall' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-crea-primary"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={cn(
            "flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-colors relative",
            activeTab === 'activities' ? "text-crea-primary" : "text-crea-muted hover:text-crea-text"
          )}
        >
          Versenyszámok szerint
          {activeTab === 'activities' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-crea-primary"></span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input 
          type="text" 
          placeholder="Keresés név alapján..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
        />
        <select 
          value={filterClass} 
          onChange={(e) => setFilterClass(e.target.value)}
          className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
        >
          <option value="all">Minden osztály</option>
          {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={filterTeam} 
          onChange={(e) => setFilterTeam(e.target.value)}
          className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
        >
          <option value="all">Minden csapat</option>
          {teamOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium">
          {error}
        </div>
      ) : loading ? (
        <div className="flex justify-center p-12 flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
          <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Egyéni rangsor betöltése...</span>
        </div>
      ) : activeTab === 'overall' ? (
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-4 sm:p-10">
          <div className="flex justify-between items-end mb-6 px-2">
            <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-1">Dicsőségfal</h2>
            <span className="text-[10px] bg-crea-primary text-crea-bg border border-crea-bg px-3 py-1 uppercase tracking-widest shadow-sm">Egyéni</span>
          </div>

          <ul className="space-y-4 relative z-10 w-full overflow-x-auto">
            {filteredLeaderboard.length === 0 ? (
              <li className="p-12 text-center text-crea-muted font-display tracking-widest uppercase">
                Még nincs egyéni pontbejegyzés.
              </li>
            ) : (
              filteredLeaderboard.map((row, index) => {
                const isTop3 = index < 3;
                return (
                  <li 
                    key={row.participant_id}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 transition-all border relative overflow-hidden group min-w-[300px]",
                      index === 0 ? "bg-[#FDFBF7] border-crea-accent shadow-[0_4px_15px_rgba(207,160,82,0.15)]" :
                      index === 1 ? "bg-stone-50 border-stone-300" :
                      index === 2 ? "bg-crea-accent/5 border-[#B17A44]/30" :
                      "bg-white border-transparent hover:border-crea-accent/20 border-b-crea-muted/10"
                    )}
                  >
                    <div className="flex-shrink-0 w-12 text-center flex justify-center items-center relative z-10 mb-4 sm:mb-0">
                      {renderBadge(index)}
                    </div>

                    <div className="ml-0 sm:ml-4 flex-1 flex flex-col justify-center relative z-10">
                      <div className={cn(
                        "text-xl sm:text-2xl font-display font-medium tracking-wide uppercase",
                        isTop3 ? "text-crea-text" : "text-stone-600"
                      )}>
                        {row.full_name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {row.class_name && (
                           <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 border border-stone-200 uppercase tracking-widest font-bold">
                             {row.class_name}
                           </span>
                        )}
                        {renderTeamBadge(row.team_id, row.team_name)}
                      </div>
                    </div>

                    <div className="ml-0 sm:ml-4 flex items-center sm:justify-end text-left sm:text-right relative z-10 mt-4 sm:mt-0">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-2xl sm:text-4xl font-display font-black text-crea-primary tabular-nums">
                          {row.total_points}
                        </span>
                        <span className="text-[10px] font-bold text-crea-muted uppercase tracking-[0.2em] mt-1">
                          Drachma
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      ) : (
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-4 sm:p-10 overflow-x-auto">
            <table className="w-full text-left border-collapse relative z-10">
              <thead>
                <tr className="border-b border-crea-accent/30 text-xs font-bold text-crea-muted uppercase tracking-widest">
                  <th className="py-4 px-2">Versenyszám</th>
                  <th className="py-4 px-2">Név</th>
                  <th className="py-4 px-2 hidden sm:table-cell">Osztály</th>
                  <th className="py-4 px-2 hidden md:table-cell">Csapat</th>
                  <th className="py-4 px-2 text-right">Pont</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crea-accent/10">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-crea-muted font-display tracking-widest uppercase">
                      Még nincs egyéni pontbejegyzés.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((row) => (
                    <tr key={`${row.activity_id}-${row.participant_id}`} className="hover:bg-white/50 transition-colors">
                      <td className="py-4 px-2 font-bold text-crea-primary uppercase tracking-widest text-xs">
                        {row.activity_name}
                      </td>
                      <td className="py-4 px-2 font-medium text-crea-text font-display uppercase tracking-wide">
                        {row.full_name}
                        <div className="sm:hidden text-[10px] text-stone-500 mt-1">{row.class_name}</div>
                      </td>
                      <td className="py-4 px-2 text-sm text-stone-600 hidden sm:table-cell">
                        {row.class_name || '-'}
                      </td>
                      <td className="py-4 px-2 text-sm hidden md:table-cell">
                        {renderTeamBadge(row.team_id, row.team_name)}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <span className="text-xl font-display font-black text-crea-text tabular-nums">
                          {row.total_points}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
