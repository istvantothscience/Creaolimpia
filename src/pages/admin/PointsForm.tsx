import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/database';
import { Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function PointsForm() {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [campDay, setCampDay] = useState<string>('1');
  const [points, setPoints] = useState<number>(0);
  const [note, setNote] = useState<string>('');
  
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
      setNote('');
      setSelectedTeam('');
      
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.warn('Error saving points:', error);
      alert('Hiba történt a mentés során.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-crea-primary" /></div>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-crea-text tracking-tight">Pontozás</h1>
        <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest">Gyors pontadás a csapatoknak</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6">
        
        <div>
          <label htmlFor="campDay" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Tábori Nap</label>
          <select
            id="campDay"
            required
            value={campDay}
            onChange={(e) => setCampDay(e.target.value)}
            className="block w-full px-4 py-3 text-sm font-bold border border-stone-200 focus:outline-none focus:ring-crea-primary focus:border-crea-primary rounded-2xl bg-stone-50/50 transition-colors"
          >
            {[1, 2, 3, 4].map(day => (
              <option key={day} value={day}>{day}. Nap</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="team" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Csapat</label>
          <select
            id="team"
            required
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="block w-full px-4 py-3 text-sm font-bold border border-stone-200 focus:outline-none focus:ring-crea-primary focus:border-crea-primary rounded-2xl bg-stone-50/50 transition-colors"
          >
            <option value="" disabled>Válassz csapatot...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="points" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Pontszám</label>
          <div className="flex flex-wrap items-center gap-3">
             <input
              type="number"
              id="points"
              required
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="block w-32 px-4 py-3 text-xl font-black text-crea-primary border border-stone-200 focus:outline-none focus:ring-crea-primary focus:border-crea-primary rounded-2xl bg-stone-50/50 transition-colors"
            />
            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2">
              {[-5, -1, 1, 5, 10].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPoints(p => p + val)}
                  className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl text-sm transition-colors"
                >
                  {val > 0 ? '+' : ''}{val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
           <label htmlFor="note" className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Megjegyzés / Feladat (Opcionális)</label>
           <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Pl.: Akadályverseny 1. hely"
            className="block w-full px-4 py-3 text-sm font-medium border border-stone-200 focus:outline-none focus:ring-crea-primary focus:border-crea-primary rounded-2xl bg-stone-50/50 transition-colors"
          />
        </div>

        <div className="pt-6 border-t border-stone-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-white bg-crea-primary hover:bg-crea-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crea-primary disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <>
                <Check className="w-5 h-5 mr-2" /> Mentve!
              </>
            ) : (
              'Mentés'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
