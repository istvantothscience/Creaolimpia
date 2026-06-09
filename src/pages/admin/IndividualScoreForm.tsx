import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Loader2, Check, UserPlus } from 'lucide-react';
import { OlympiaParticipant, IndividualActivity, IndividualScoreEntryInput } from '@/types/database';
import { individualService } from '@/services/individualService';

export default function IndividualScoreForm() {
  const { profile } = useAuth();
  
  const [participants, setParticipants] = useState<OlympiaParticipant[]>([]);
  const [activities, setActivities] = useState<IndividualActivity[]>([]);
  
  const [selectedParticipant, setSelectedParticipant] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [placement, setPlacement] = useState<string>('');
  const [metricLabel, setMetricLabel] = useState<string>('');
  const [metricValue, setMetricValue] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [scoreDate, setScoreDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [parts, acts] = await Promise.all([
        individualService.getParticipants(),
        individualService.getIndividualActivities()
      ]);
      setParticipants(parts);
      setActivities(acts);
    } catch (err) {
      console.error(err);
      setError('Nem sikerült betölteni az adatokat.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = (activityId: string) => {
    setSelectedActivity(activityId);
    const act = activities.find(a => a.id === activityId);
    if (act && act.default_points !== null) {
      setPoints(act.default_points);
    } else {
      setPoints(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    if (!selectedParticipant) {
      alert('Válassz diákot.'); return;
    }
    if (!selectedActivity) {
      alert('Válassz versenyszámot.'); return;
    }
    if (points === null || points === undefined) {
      alert('Adj meg pontszámot.'); return;
    }

    setSubmitting(true);
    setSuccess(false);

    try {
      const entry: IndividualScoreEntryInput = {
        participant_id: selectedParticipant,
        activity_id: selectedActivity,
        points: Number(points),
        placement: placement ? Number(placement) : null,
        metric_label: metricLabel || null,
        metric_value: metricValue ? Number(metricValue) : null,
        note: note || null,
        score_date: scoreDate,
        created_by: profile.id
      };

      await individualService.createIndividualScoreEntry(entry);
      
      setSuccess(true);
      
      // Reset some fields
      setTimeout(() => {
        setSuccess(false);
        setSelectedParticipant('');
        setPlacement('');
        setMetricLabel('');
        setMetricValue('');
        setNote('');
      }, 2000);
      
    } catch (err: any) {
      console.warn('Error saving individual points:', err);
      alert('Nem sikerült menteni az egyéni pontot. ' + (err.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-12 flex-col items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div>
      <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Adatok betöltése...</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-16">
      <div className="pt-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text uppercase tracking-widest">Egyéni Pontozás</h1>
        <p className="mt-2 text-sm font-bold text-crea-muted uppercase tracking-[0.2em] flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Egyéni teljesítmény rögzítése
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium">
          {error}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none p-8 sm:p-12 rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 space-y-8 z-10">
          
          <div className="relative z-10">
            <label htmlFor="participant" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Diák (Résztvevő) *</label>
            <select
              id="participant"
              required
              value={selectedParticipant}
              onChange={(e) => setSelectedParticipant(e.target.value)}
              className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
            >
              <option value="" disabled>Válassz résztvevőt...</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} {p.class_name ? `(${p.class_name})` : ''} - {p.team_id ? 'Csapatba osztva' : 'Nincs csapat'}
                </option>
              ))}
            </select>
          </div>

          <div className="relative z-10">
            <label htmlFor="activity" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Versenyszám *</label>
            <select
              id="activity"
              required
              value={selectedActivity}
              onChange={(e) => handleActivityChange(e.target.value)}
              className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
            >
              <option value="" disabled>Válassz versenyszámot...</option>
              {activities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative z-10">
            <label htmlFor="points" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Drachmák Száma (Pont) *</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
               <input
                type="number"
                id="points"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="block w-32 px-5 py-4 text-2xl font-display font-black text-crea-primary text-center border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner tabular-nums"
              />
              <div className="flex flex-wrap gap-2">
                {[-1, +1, +2, +5, +10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPoints(p => Number(p) + val)}
                    className="px-5 py-4 bg-white hover:bg-[#FDFBF7] border border-crea-accent/20 text-crea-text font-display font-bold rounded-sm text-sm transition-colors uppercase tracking-widest min-w-[3rem]"
                  >
                    {val > 0 ? '+' : ''}{val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label htmlFor="placement" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Helyezés (Opcionális)</label>
              <input
                type="number"
                id="placement"
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="pl. 1"
                className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
              />
            </div>
            <div>
               <label htmlFor="scoreDate" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Dátum</label>
               <input
                  type="date"
                  id="scoreDate"
                  value={scoreDate}
                  onChange={(e) => setScoreDate(e.target.value)}
                  className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
             <div>
              <label htmlFor="metricLabel" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Mérőszám típus</label>
              <input
                type="text"
                id="metricLabel"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="pl. méter, kör"
                className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
              />
            </div>
            <div>
              <label htmlFor="metricValue" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Mérőszám érték</label>
              <input
                type="number"
                step="0.01"
                id="metricValue"
                value={metricValue}
                onChange={(e) => setMetricValue(e.target.value)}
                placeholder="pl. 4.5"
                className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7]"
              />
            </div>
          </div>

          <div className="relative z-10">
             <label htmlFor="note" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Megjegyzés (Opcionális)</label>
             <input
              type="text"
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Rövid megjegyzés..."
              className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] italic"
            />
          </div>

          <div className="pt-8 border-t border-crea-accent/10 relative z-10">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center items-center py-5 px-4 border border-transparent rounded-sm shadow-[0_4px_15px_rgba(140,58,39,0.2)] text-sm font-bold uppercase tracking-widest text-[#FDFBF7] bg-crea-primary hover:bg-[#5A2315] focus:outline-none disabled:opacity-50 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <>
                  <Check className="w-5 h-5 mr-3" /> Egyéni pont sikeresen rögzítve!
                </>
              ) : (
                'Pont mentése'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
