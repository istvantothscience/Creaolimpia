import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Crown } from 'lucide-react';
import { teamService } from '@/services/teamService';
import { TeamWithMembers } from '@/types/database';
import { cn } from '@/lib/utils';

export default function TeamDetailsPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const [teamData, setTeamData] = useState<TeamWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!teamId) return;

    teamService.getTeamsWithMembers()
      .then(teams => {
        const found = teams.find(t => t.team.id === teamId);
        if (found) {
          setTeamData(found);
        } else {
          setError('A csapat nem található.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Nem sikerült betölteni a csapattagokat.');
      })
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) {
    return (
      <div className="flex justify-center p-12 flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
        <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Csapat betöltése...</span>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium max-w-4xl mx-auto mt-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      <div className="pt-8">
        <Link to="/teams" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-crea-muted hover:text-crea-text transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Vissza a csapatokhoz
        </Link>
      </div>

      <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-8 sm:p-12 overflow-hidden">
        
        <div 
          className="absolute top-0 right-0 w-64 h-64 bg-current opacity-[0.03] rounded-bl-[200px] transform origin-top-right scale-150 pointer-events-none"
          style={{ color: teamData.team.color || '#CFA052' }}
        ></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-crea-accent/20 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4 flex-col sm:flex-row">
            <Shield className="w-16 h-16 sm:w-20 sm:h-20" style={{ color: teamData.team.color || '#CFA052' }} />
            <div>
              <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">
                {teamData.team.name}
              </h1>
              <span 
                className="inline-block text-xs uppercase font-bold tracking-widest px-3 py-1 border mt-2"
                style={{ 
                  borderColor: teamData.team.color || '#CFA052', 
                  color: teamData.team.color || '#CFA052',
                  backgroundColor: `${teamData.team.color || '#CFA052'}10`
                }}
              >
                {teamData.rank}. Helyezés
              </span>
            </div>
          </div>
          
          <div className="text-center sm:text-right bg-white p-6 border border-crea-accent/20 rounded-sm shadow-sm min-w-[200px]">
            <span className="text-4xl font-display font-black text-crea-primary tabular-nums block leading-none">
              {teamData.totalPoints}
            </span>
            <span className="text-xs font-bold text-crea-muted uppercase tracking-[0.2em] mt-1 block">
              Összpontszám
            </span>
            <div className="flex justify-center sm:justify-end gap-3 mt-3 pt-3 border-t border-crea-accent/10">
               <div className="text-center">
                 <div className="text-lg font-bold text-stone-600 leading-none">{teamData.teamPoints}</div>
                 <div className="text-[9px] uppercase tracking-wider text-crea-muted">Csapat</div>
               </div>
               <div className="w-px bg-crea-accent/20"></div>
               <div className="text-center">
                 <div className="text-lg font-bold text-stone-600 leading-none">{teamData.individualPoints}</div>
                 <div className="text-[9px] uppercase tracking-wider text-crea-muted">Egyéni</div>
               </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12">
           <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.2em] mb-6">Polgárok ({teamData.members.length})</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-crea-accent/30 text-xs font-bold text-crea-muted uppercase tracking-widest">
                    <th className="py-4 px-2 w-16 text-center">No.</th>
                    <th className="py-4 px-2">Név</th>
                    <th className="py-4 px-2 text-center">Osztály</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crea-accent/10">
                  {teamData.members.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-sm font-bold uppercase tracking-widest text-crea-muted">
                        Még nincsenek csapattagok.
                      </td>
                    </tr>
                  ) : (
                    teamData.members.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-white/50 transition-colors">
                        <td className="py-4 px-2 text-center font-display font-bold text-stone-400">
                          {member.participant_order || idx + 1}
                        </td>
                        <td className="py-4 px-2 font-medium text-crea-text font-display uppercase tracking-wide">
                          {member.full_name}
                        </td>
                        <td className="py-4 px-2 text-center text-sm font-bold text-stone-600 uppercase tracking-widest">
                          {member.class_name || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>
        </div>

      </div>
    </div>
  );
}
