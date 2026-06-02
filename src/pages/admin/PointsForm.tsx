import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/database';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function PointsForm({ 
  initialCampDay, 
  initialNote, 
  onClose 
}: { 
  initialCampDay?: string; 
  initialNote?: string; 
  onClose?: () => void; 
} = {}) {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [campDay, setCampDay] = useState<string>(initialCampDay || '1');
  const [points, setPoints] = useState<number>(0);
  const [note, setNote] = useState<string>(initialNote || '');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('teams').select('*').order('name');
      if (data) setTeams(data as Team[]);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !profile) return;
    if (!selectedTeam) return;

    setSubmitting(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('team_points')
        .insert({
          team_id: selectedTeam,
          camp_day: parseInt(campDay, 10),
          points: points,
          note: note,
          entered_by: profile.id
        });

      if (error) throw error;
      
      setSuccess(true);
      // Állítsuk vissza, de a nap maradjon hogy gyorsan lehessen rögzíteni
      if (!onClose) {
        setNote('');
        setSelectedTeam('');
      }
      
      setTimeout(() => {
        setSuccess(false);
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.warn('Error saving points:', error);
      alert('Hiba történt a mentés során.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crea-primary" /></div>;

  return (
    <div className={onClose ? "max-w-xl mx-auto" : "max-w-xl mx-auto space-y-12 pb-16"}>
      {!onClose && (
        <div className="pt-8 mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text uppercase tracking-widest">Osztás</h1>
          <p className="mt-2 text-sm font-bold text-crea-muted uppercase tracking-[0.2em] flex items-center justify-center">
            <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
            Drachmák Adományozása
            <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={onClose ? "space-y-8 relative z-10" : "bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none p-8 sm:p-12 rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 space-y-8 z-10"}>
        
        <div className="relative z-10">
          <label htmlFor="campDay" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Az Olimpia Napja</label>
          <select
            id="campDay"
            required
            value={campDay}
            onChange={(e) => setCampDay(e.target.value)}
            className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
          >
            {[1, 2, 3, 4].map(day => (
              <option key={day} value={day}>{day}. Nap</option>
            ))}
          </select>
        </div>

        <div className="relative z-10">
          <label htmlFor="team" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Polisz (Csapat)</label>
          <select
            id="team"
            required
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="block w-full px-5 py-4 text-sm font-bold border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
          >
            <option value="" disabled>Válassz poliszt...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative z-10">
          <label htmlFor="points" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Drachmák Száma</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
             <input
              type="number"
              id="points"
              required
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="block w-32 px-5 py-4 text-2xl font-display font-black text-crea-primary text-center border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner tabular-nums"
            />
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              {[-5, -1, 1, 5, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPoints(p => p + val)}
                  className="px-5 py-4 bg-white hover:bg-[#FDFBF7] border border-crea-accent/20 text-crea-text font-display font-bold rounded-sm text-sm transition-colors uppercase tracking-widest min-w-[3rem]"
                >
                  {val > 0 ? '+' : ''}{val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <label htmlFor="note" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Krónika / Tett (Opcionális)</label>
           <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pl.: Hősies küzdelem a pankrációban..."
            className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner italic"
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
                <Check className="w-5 h-5 mr-3" /> Eredmény Megírva!
              </>
            ) : (
              'Drachmák Adományozása'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
