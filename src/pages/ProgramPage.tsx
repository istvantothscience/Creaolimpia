import { useState, useEffect } from 'react';
import { Flame, MapPin, X, Landmark, Trophy, User, Users, Coffee, Bus, BedDouble, Tent, Award } from 'lucide-react';
import { WeeklyProgramEvent } from '@/types/database';
import { useAuth } from '@/lib/AuthContext';
import { programService } from '@/services/programService';
import ProgramScoreModal from '@/components/ProgramScoreModal';
import { cn } from '@/lib/utils';

export default function ProgramPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<WeeklyProgramEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<WeeklyProgramEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const canGivePoints = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await programService.getWeeklyProgram();
      setItems(data);
    } catch (e) {
      console.warn(e);
      setError('Nem sikerült betölteni a programot.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12 flex-col items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent mb-4"></div><span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Program betöltése...</span></div>;

  const filteredItems = items.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'scoreable') return item.is_scoreable;
    if (filter === 'team_sport') return item.event_type === 'team_sport' || item.event_type === 'team_challenge';
    if (filter === 'individual_sport') return item.event_type === 'individual_sport' || item.event_type === 'individual_challenge';
    if (filter === 'common') return item.event_type === 'general_program' || item.event_type === 'ceremony';
    if (filter === 'logistics') return item.event_type === 'meal' || item.event_type === 'travel' || item.event_type === 'rest';
    return true;
  });

  // Group by day_name
  const groupedItems = filteredItems.reduce((acc, item) => {
    const day = item.day_name;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<string, WeeklyProgramEvent[]>);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'team_sport':
      case 'team_challenge': return <Users className="w-4 h-4" />;
      case 'individual_sport':
      case 'individual_challenge': return <User className="w-4 h-4" />;
      case 'meal': return <Coffee className="w-4 h-4" />;
      case 'travel': return <Bus className="w-4 h-4" />;
      case 'rest':
      case 'free_time': return <BedDouble className="w-4 h-4" />;
      case 'ceremony': return <Award className="w-4 h-4" />;
      default: return <Tent className="w-4 h-4" />;
    }
  };

  const getEventLabel = (type: string) => {
     switch (type) {
      case 'team_sport': return 'Csapatsport';
      case 'team_challenge': return 'Csapatkihívás';
      case 'individual_sport': return 'Egyéni Sport';
      case 'individual_challenge': return 'Egyéni Kihívás';
      case 'meal': return 'Étkezés';
      case 'travel': return 'Utazás';
      case 'rest': return 'Pihenő';
      case 'free_time': return 'Szabadidő';
      case 'ceremony': return 'Ünnepély';
      default: return 'Közös Program';
    }
  };

  const isSport = (type: string) => ['team_sport', 'team_challenge', 'individual_sport', 'individual_challenge'].includes(type);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <Flame className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Tábori program</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Crea Olimpia heti menetrend
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 text-center font-medium">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'all', label: 'Összes' },
          { id: 'scoreable', label: 'Pontozható' },
          { id: 'team_sport', label: 'Csapatsport' },
          { id: 'individual_sport', label: 'Egyéni sport' },
          { id: 'common', label: 'Közös programok' },
          { id: 'logistics', label: 'Étkezés / Utazás' },
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-all border",
              filter === btn.id 
                ? "bg-crea-primary border-crea-primary text-white shadow-sm" 
                : "bg-[#FDFBF7] border-crea-accent/30 text-crea-muted hover:border-crea-primary hover:text-crea-primary"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-12 text-center text-crea-muted font-display tracking-widest uppercase">
          Még nincs feltöltött program.
        </div>
      ) : (
        <div className="space-y-12">
          {(Object.entries(groupedItems) as [string, WeeklyProgramEvent[]][]).map(([day, dayItems]) => (
            <div key={day} className="relative">
              <h2 className="text-xl sm:text-2xl font-display font-black text-crea-text uppercase tracking-widest mb-6 sticky top-20 bg-[#F5F2E9]/90 backdrop-blur-md py-4 z-10 border-b border-crea-accent/20 flex items-center">
                <Landmark className="w-6 h-6 mr-3 text-crea-accent" />
                {day}
              </h2>
              
              <div className="space-y-4">
                {dayItems.map(item => {
                  const clickable = item.is_scoreable || item.description;
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => { if (clickable) setSelectedProgram(item); }}
                      className={cn(
                        "bg-[#FDFBF7] p-6 sm:p-8 rounded-sm shadow-sm border flex flex-col sm:flex-row transition-all relative overflow-hidden group",
                        isSport(item.event_type) ? "border-crea-primary/30" : "border-crea-accent/20",
                        clickable ? 'hover:shadow-[0_4px_20px_rgba(207,160,82,0.15)] hover:border-crea-accent/50 cursor-pointer' : 'opacity-90'
                      )}
                    >
                      <div className="flex-shrink-0 w-32 border-b sm:border-b-0 sm:border-r border-crea-accent/20 pb-4 sm:pb-0 sm:pr-6 mb-4 sm:mb-0 relative py-2">
                        <div className="absolute -left-[5px] top-1/2 -mt-1 w-2 h-2 bg-crea-accent rotate-45 sm:hidden"></div>
                        <div className="flex items-center text-crea-primary font-display font-black text-xl tracking-wider">
                          {item.time_label || item.start_time?.slice(0, 5) || 'Egész nap'}
                        </div>
                        {item.end_time && !item.time_label && (
                          <div className="text-crea-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                            — {item.end_time.slice(0, 5)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 sm:px-8">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-display font-medium text-crea-text tracking-wide uppercase pr-4">{item.title}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border",
                              isSport(item.event_type) ? "bg-crea-primary/10 text-crea-primary border-crea-primary/20" : "bg-crea-muted/10 text-crea-muted border-crea-muted/20"
                            )}>
                              {getEventIcon(item.event_type)}
                              <span className="ml-1 hidden sm:inline">{getEventLabel(item.event_type)}</span>
                            </span>
                            {item.is_scoreable && (
                              <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest border bg-crea-accent/10 border-crea-accent/30 text-[#8C3A27]">
                                <Trophy className="w-3 h-3 mr-1" />
                                Pontozható
                              </span>
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <p className="mt-2 text-sm text-stone-600 leading-relaxed font-sans line-clamp-2">{item.description}</p>
                        )}
                        
                        <div className="mt-4 flex flex-wrap items-center gap-4">
                          {item.location && (
                            <div className="flex items-center text-xs font-bold text-crea-primary uppercase tracking-widest bg-crea-primary/5 px-2 py-1 border border-crea-primary/10">
                              <MapPin className="w-3 h-3 mr-1.5" />
                              {item.location}
                            </div>
                          )}
                          {item.coordinator && (
                            <div className="flex items-center text-xs font-bold text-crea-muted uppercase tracking-widest">
                              <User className="w-3 h-3 mr-1" />
                              {item.coordinator}
                            </div>
                          )}
                          
                          {item.is_scoreable && canGivePoints && (
                             <div className="ml-auto flex items-center text-xs font-bold text-[#8C3A27] uppercase tracking-widest hover:text-crea-primary">
                                Pont adása &rarr;
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProgram && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C241B]/60 backdrop-blur-md">
          <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto outline-none animate-in fade-in zoom-in-95 duration-200 border border-crea-accent/50 flex flex-col">
            <div className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md px-8 py-5 border-b border-crea-accent/20 flex items-center justify-between z-20">
              <h3 className="text-xl font-display font-black text-crea-text uppercase tracking-widest truncate pr-4">
               {selectedProgram.is_scoreable && canGivePoints ? 'Pontadás' : 'Részletek'} <span className="mx-2 text-crea-accent">—</span> <span className="font-medium text-crea-primary truncate">{selectedProgram.title}</span>
              </h3>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="p-2 text-crea-muted hover:text-crea-primary hover:bg-crea-primary/10 transition-colors bg-white relative z-20 shadow-sm border border-crea-muted/20 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 relative z-10 flex-1">
              
              <div className="mb-6 space-y-4">
                 <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-widest">
                    <span className="bg-crea-primary/10 text-crea-primary px-3 py-1 border border-crea-primary/20">
                      {selectedProgram.day_name} • {selectedProgram.time_label || selectedProgram.start_time?.slice(0,5)}
                    </span>
                    <span className="bg-crea-accent/10 text-[#8C3A27] px-3 py-1 border border-crea-accent/30">
                      {getEventLabel(selectedProgram.event_type)}
                    </span>
                    {selectedProgram.scoring_mode && (
                       <span className="bg-stone-100 text-stone-600 px-3 py-1 border border-stone-200">
                         {selectedProgram.scoring_mode}
                       </span>
                    )}
                 </div>
                 
                 {selectedProgram.description && (
                   <p className="text-stone-700 font-sans leading-relaxed text-sm">
                     {selectedProgram.description}
                   </p>
                 )}
                 
                 <div className="flex flex-wrap gap-4 pt-2">
                   {selectedProgram.location && (
                     <div className="flex items-center text-sm font-medium text-crea-text">
                       <MapPin className="w-4 h-4 mr-2 text-crea-primary" />
                       Helyszín: {selectedProgram.location}
                     </div>
                   )}
                   {selectedProgram.coordinator && (
                     <div className="flex items-center text-sm font-medium text-crea-text">
                       <User className="w-4 h-4 mr-2 text-crea-primary" />
                       Szervező: {selectedProgram.coordinator}
                     </div>
                   )}
                 </div>
              </div>
              
              {selectedProgram.is_scoreable && canGivePoints ? (
                <div className="mt-8 border-t border-crea-accent/20 pt-8 -mx-8 px-8">
                  <ProgramScoreModal 
                    program={selectedProgram}
                    onClose={() => setSelectedProgram(null)}
                    onSuccess={() => fetchProgram()}
                  />
                </div>
              ) : selectedProgram.is_scoreable && !canGivePoints ? (
                <div className="mt-8 bg-crea-accent/5 border border-crea-accent/30 p-4 text-center rounded-sm text-sm text-[#8C3A27] font-bold uppercase tracking-widest">
                   Ez egy pontozható program, de pontot csak szervező tud rögzíteni.
                </div>
              ) : null}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
