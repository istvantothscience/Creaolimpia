import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { OlympiaParticipant, Team } from '@/types/database';
import { individualService } from '@/services/individualService';
import { Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParticipantTeamAssignment() {
  const { profile } = useAuth();
  
  const [participants, setParticipants] = useState<OlympiaParticipant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterTeam, setFilterTeam] = useState('all'); // all, unassigned, assigned

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [parts, { data: teamsData }] = await Promise.all([
        individualService.getParticipants(),
        supabase.from('teams').select('*').order('name')
      ]);
      
      setParticipants(parts);
      if (teamsData) setTeams(teamsData as Team[]);
    } catch (err) {
      console.error(err);
      setError('Nem sikerült betölteni az adatokat.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = async (participantId: string, teamId: string) => {
    if (profile?.role !== 'admin') {
      alert('Nincs jogosultságod ehhez a művelethez (csak admin).');
      return;
    }

    try {
      setSavingId(participantId);
      const val = teamId === 'null' ? null : teamId;
      await individualService.updateParticipantTeam(participantId, val);
      
      // Update local state
      setParticipants(prev => 
        prev.map(p => p.id === participantId ? { ...p, team_id: val } : p)
      );
    } catch (err: any) {
      console.warn('Error updating team:', err);
      alert('Hiba történt: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  const filteredParticipants = participants.filter(p => {
    if (search && !p.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClass !== 'all' && p.class_name !== filterClass) return false;
    if (filterTeam === 'unassigned' && p.team_id !== null) return false;
    if (filterTeam === 'assigned' && p.team_id === null) return false;
    return true;
  });

  const uniqueClasses = Array.from(new Set(participants.map(p => p.class_name).filter(Boolean))) as string[];

  if (loading) return (
    <div className="flex justify-center p-12 flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
      <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Adatok betöltése...</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="pt-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text uppercase tracking-widest">Csapatbeosztás</h1>
        <p className="mt-2 text-sm font-bold text-crea-muted uppercase tracking-[0.2em] flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Diákok Poliszokba sorolása
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
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
          <option value="all">Mindenki</option>
          <option value="unassigned">Csapat nélküliek</option>
          <option value="assigned">Csapathoz rendelt</option>
        </select>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium">
          {error}
        </div>
      ) : (
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-4 sm:p-10 overflow-x-auto">
          <div className="mb-6 flex justify-between items-center relative z-10 px-2">
            <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-1">Résztvevők ({filteredParticipants.length})</h2>
            <div className="text-[10px] text-crea-muted font-bold uppercase tracking-widest pl-4">
              Üres: Nincs csapat
            </div>
          </div>
          <table className="w-full text-left border-collapse relative z-10">
            <thead>
              <tr className="border-b border-crea-accent/30 text-xs font-bold text-crea-muted uppercase tracking-widest">
                <th className="py-4 px-2">Név</th>
                <th className="py-4 px-2 text-center">Osztály</th>
                <th className="py-4 px-2">Polisz (Csapat)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crea-accent/10">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-12 text-center text-crea-muted font-display tracking-widest uppercase">
                    Még nincs feltöltött résztvevő vagy egy sem felel meg a szűrésnek.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map(p => (
                  <tr key={p.id} className="hover:bg-white/50 transition-colors">
                    <td className="py-4 px-2 font-medium text-crea-text font-display uppercase tracking-wide">
                      {p.full_name}
                    </td>
                    <td className="py-4 px-2 text-sm text-stone-600 text-center uppercase tracking-widest font-bold">
                      {p.class_name || '-'}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={p.team_id || 'null'}
                          onChange={(e) => handleTeamChange(p.id, e.target.value)}
                          disabled={savingId === p.id || profile?.role !== 'admin'}
                          className={cn(
                            "block w-full max-w-[200px] px-3 py-2 text-xs font-bold border rounded-sm focus:outline-none focus:ring-1 transition-colors uppercase tracking-widest",
                            p.team_id ? "bg-crea-accent/5 border-[#B17A44]/30 text-[#8C3A27] focus:ring-[#8C3A27]" : "bg-white border-crea-accent/30 text-crea-muted focus:ring-crea-primary",
                            savingId === p.id && "opacity-50"
                          )}
                        >
                          <option value="null">- Nincs csapat -</option>
                          {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        {savingId === p.id && <Loader2 className="w-4 h-4 text-crea-primary animate-spin" />}
                      </div>
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
