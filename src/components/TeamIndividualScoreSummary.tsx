import { useState, useEffect } from 'react';
import { individualService } from '@/services/individualService';
import { TeamIndividualScoreSummaryRow } from '@/types/database';

export default function TeamIndividualScoreSummary() {
  const [data, setData] = useState<TeamIndividualScoreSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    individualService.getTeamIndividualScoreSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Betöltés...</div>;

  return (
    <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-6 mt-8">
      <h2 className="text-xl font-display font-medium text-crea-text uppercase tracking-widest mb-4">Egyéni pontok csapatonként</h2>
      <p className="text-xs text-crea-muted mb-6">
        Itt lehet nyomon követni, hogy az egyéni versenyszámokban szerzett pontokból melyik csapat mennyi extrát szedett össze. Ezt hozzá lehet adni a fő ranglistához.
      </p>
      
      <div className="overflow-x-auto relative z-10 w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-crea-accent/30 text-xs font-bold text-crea-muted uppercase tracking-widest">
              <th className="py-3 px-2">Csapat</th>
              <th className="py-3 px-2 text-right">Diákok száma</th>
              <th className="py-3 px-2 text-right">Eredmények</th>
              <th className="py-3 px-2 text-right font-bold text-crea-primary">Összpont</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-crea-accent/10">
            {data.map(row => (
              <tr key={row.team_id || 'null'} className="hover:bg-white/50">
                <td className="py-3 px-2 font-display uppercase font-medium">{row.team_name || 'Nincs csapathoz rendelve'}</td>
                <td className="py-3 px-2 text-right tabular-nums text-sm text-stone-600">{row.participants_with_team}</td>
                <td className="py-3 px-2 text-right tabular-nums text-sm text-stone-600">{row.score_entries_count}</td>
                <td className="py-3 px-2 text-right tabular-nums font-bold text-crea-primary text-lg">{row.individual_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
