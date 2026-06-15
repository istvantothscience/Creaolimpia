import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Team, WeeklyProgramEvent, ProgramScoreEntryInput, OlympiaParticipant } from '@/types/database';
import { Check, Loader2, X } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { programService } from '@/services/programService';

interface ProgramScoreModalProps {
  program: WeeklyProgramEvent;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProgramScoreModal({ program, onClose, onSuccess }: ProgramScoreModalProps) {
  const { profile } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [participants, setParticipants] = useState<(OlympiaParticipant & { team_name?: string })[]>([]);
  
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [points, setPoints] = useState<number>(program.default_points || 0);
  
  // For individual events, we want participant ID or name. Since type is string, we store full_name.
  // Actually, wait! The prompt says: "diáklistát innen töltsd: olympia_participants rendezve csapat, név. A dropdownban jelenjen meg: 'Név (Osztály) - Csapat'". We will save their full_name into student_name.
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>(''); // fallback
  
  const [metricLabel, setMetricLabel] = useState<string>('');
  const [metricValue, setMetricValue] = useState<string>('');
  const [note, setNote] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if we should emphasize student name
  const isIndividualEvent = program.event_type === 'individual_sport' || program.event_type === 'individual_challenge';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) return;
    try {
      const [{ data: teamsData }, { data: partData }] = await Promise.all([
        supabase.from('teams').select('id, name, color').order('name'),
        supabase.from('olympia_participants').select('*').order('full_name') // we will sort in JS to ensure team is first
      ]);
      
      let teamsList: Team[] = [];
      if (teamsData) {
        teamsList = teamsData as Team[];
        setTeams(teamsList);
      }
      
      if (partData) {
        const enriched = partData.map(p => {
           const team = teamsList.find(t => t.id === p.team_id);
           return { ...p, team_name: team ? team.name : 'Nincs csapat' };
        });
        
        enriched.sort((a, b) => {
           const teamCmp = (a.team_name || '').localeCompare(b.team_name || '');
           if (teamCmp !== 0) return teamCmp;
           return (a.full_name || '').localeCompare(b.full_name || '');
        });
        
        setParticipants(enriched);
      }

    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedParticipantId(pId);
    
    if (pId) {
      const p = participants.find(x => x.id === pId);
      if (p) {
        if (p.team_id) {
          setSelectedTeam(p.team_id);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (isIndividualEvent && !selectedParticipantId) {
      alert('Kérlek válassz diákot az egyéni versenyszámhoz.');
      return;
    }
    
    if (!isIndividualEvent && !selectedTeam) {
      alert('Válassz csapatot.');
      return;
    }
    
    if (isIndividualEvent && !selectedTeam) {
      alert('A választott diáknak nincs csapata beállítva rendszerben.');
      return;
    }
    
    if (points === null || points === undefined) {
      alert('Adj meg pontszámot.');
      return;
    }

    setSubmitting(true);
    setSuccess(false);

    let finalStudentName = studentName;
    if (isIndividualEvent && selectedParticipantId) {
      const p = participants.find(x => x.id === selectedParticipantId);
      if (p) {
        finalStudentName = p.full_name;
      }
    }

    try {
      const entry: ProgramScoreEntryInput = {
        program_event_id: program.id,
        team_id: selectedTeam,
        student_name: finalStudentName || null,
        points: Number(points),
        note: note || null,
        metric_label: metricLabel || null,
        metric_value: metricValue ? Number(metricValue) : null,
        created_by: profile.id
      };

      await programService.createProgramScoreEntry(entry);
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.warn('Error saving points:', error);
      alert('Nem sikerült menteni a pontot. ' + (error.message || ''));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="p-12 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-crea-primary" />
      <p className="mt-4 text-sm font-bold text-crea-muted uppercase tracking-widest">Poliszok betöltése...</p>
    </div>
  );

  return (
    <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none p-8 sm:p-12 rounded-sm space-y-8 z-10 w-full">
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {!isIndividualEvent && (
            <div className="relative z-10">
              <label htmlFor="team" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Polisz (Csapat) *</label>
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
          )}

          <div className="relative z-10">
            <label htmlFor="points" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Drachmák Száma *</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <input
                type="number"
                id="points"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value))}
                className="block w-full px-5 py-4 text-2xl font-display font-black text-crea-primary text-center border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner tabular-nums"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 pt-2">
            {[-1, +1, +2, +5, +10].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setPoints(p => Number(p) + val)}
                className="flex-1 px-4 py-3 bg-white hover:bg-[#FDFBF7] border border-crea-accent/20 text-crea-text font-display font-bold rounded-sm text-sm transition-colors uppercase tracking-widest min-w-[3rem] text-center"
              >
                {val > 0 ? '+' : ''}{val}
              </button>
            ))}
        </div>

        <div className="relative z-10">
          <label htmlFor="studentName" className={`block text-xs font-bold uppercase tracking-widest mb-3 ${isIndividualEvent ? 'text-crea-primary' : 'text-crea-text'}`}>
            Tanuló kiválasztása {isIndividualEvent && '(Kötelező egyéni sportnál)'}
          </label>
          
          {isIndividualEvent ? (
            <select
              id="studentSelector"
              value={selectedParticipantId}
              onChange={handleParticipantChange}
              className="block w-full px-5 py-4 text-sm font-bold border border-crea-primary focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
            >
              <option value="">Válassz diákot...</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.class_name || '-'}) - {p.team_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              id="studentName"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Tanuló neve vagy beceneve"
              className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
            />
          )}
        </div>

        {!isIndividualEvent && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative z-10">
                <label htmlFor="metricLabel" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Mérőszám típusa</label>
                <input
                  type="text"
                  id="metricLabel"
                  value={metricLabel}
                  onChange={(e) => setMetricLabel(e.target.value)}
                  placeholder="pl. gól, kör, méter, perc, helyezés"
                  className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
                />
              </div>

              <div className="relative z-10">
                <label htmlFor="metricValue" className="block text-xs font-bold text-crea-text uppercase tracking-widest mb-3">Mérőszám értéke</label>
                <input
                  type="number"
                  id="metricValue"
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  placeholder="pl. 3"
                  className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner tabular-nums"
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
                placeholder="Rövid megjegyzés"
                className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner italic"
              />
            </div>
          </>
        )}

        <div className="pt-8 border-t border-crea-accent/10 relative z-10 flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-1/3 flex justify-center items-center py-5 px-4 border border-crea-accent/30 rounded-sm text-sm font-bold uppercase tracking-widest text-crea-text bg-white hover:bg-stone-50 focus:outline-none disabled:opacity-50 transition-colors"
          >
            Mégse
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-2/3 flex justify-center items-center py-5 px-4 border border-transparent rounded-sm shadow-[0_4px_15px_rgba(140,58,39,0.2)] text-sm font-bold uppercase tracking-widest text-[#FDFBF7] bg-crea-primary hover:bg-[#5A2315] focus:outline-none disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <>
                <Check className="w-5 h-5 mr-3" /> Pont sikeresen rögzítve
              </>
            ) : (
              'Pont mentése'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
