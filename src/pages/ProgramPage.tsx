import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Flame, MapPin, X, Landmark } from 'lucide-react';
import { WeeklyProgram } from '@/types/database';
import { useAuth } from '@/lib/AuthContext';
import PointsForm from './admin/PointsForm';

export default function ProgramPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<WeeklyProgram | null>(null);

  const canGivePoints = profile?.role === 'admin' || profile?.role === 'teacher';

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('weekly_program')
        .select('*')
        .order('day_number', { ascending: true })
        .order('start_time', { ascending: true });
        
      if (!error && data) {
        setItems(data as WeeklyProgram[]);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-accent"></div></div>;

  // Group by day_number
  const groupedItems = items.reduce((acc, item) => {
    const day = item.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, WeeklyProgram[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <Flame className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Események</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Az Olimpia Programja
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-[0_8px_30px_rgba(44,36,27,0.1)] border border-crea-accent/30 p-12 text-center text-crea-muted font-display tracking-widest uppercase">
          Még nincsenek meghirdetett események.
        </div>
      ) : (
        <div className="space-y-12">
          {(Object.entries(groupedItems) as [string, WeeklyProgram[]][]).map(([day, dayItems]) => (
            <div key={day} className="relative">
              <h2 className="text-sm font-bold text-crea-text uppercase tracking-[0.3em] mb-6 sticky top-20 bg-[#F5F2E9]/90 backdrop-blur-md py-4 z-10 border-b border-crea-accent/20 flex items-center">
                <Landmark className="w-4 h-4 mr-3 text-crea-accent" />
                {day}. Nap
              </h2>
              
              <div className="space-y-4">
                {dayItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => { if (canGivePoints) setSelectedProgram(item); }}
                    className={`bg-[#FDFBF7] p-6 sm:p-8 rounded-sm shadow-sm border border-crea-accent/20 flex flex-col sm:flex-row sm:items-center transition-all relative overflow-hidden group ${canGivePoints ? 'hover:shadow-[0_4px_20px_rgba(207,160,82,0.15)] hover:border-crea-accent/50 cursor-pointer' : 'hover:shadow-md'}`}
                  >
                    <div className="flex-shrink-0 w-32 border-b sm:border-b-0 sm:border-r border-crea-accent/20 pb-4 sm:pb-0 sm:pr-6 mb-4 sm:mb-0 relative py-2">
                       <div className="absolute -left-[5px] top-1/2 -mt-1 w-2 h-2 bg-crea-accent rotate-45 sm:hidden"></div>
                      <div className="flex items-center text-crea-primary font-display font-black text-xl tracking-wider">
                        {item.start_time?.slice(0, 5) || 'Egész nap'}
                      </div>
                      {item.end_time && (
                        <div className="text-crea-muted text-xs font-bold uppercase tracking-[0.2em] mt-1">
                          — {item.end_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 sm:px-8">
                      <h3 className="text-xl font-display font-medium text-crea-text tracking-wide uppercase">{item.title}</h3>
                      {item.description && (
                        <p className="mt-2 text-sm text-stone-600 leading-relaxed font-sans">{item.description}</p>
                      )}
                      
                      <div className="mt-4 flex items-center space-x-4">
                        {item.location && (
                          <div className="flex items-center text-xs font-bold text-crea-primary uppercase tracking-widest bg-crea-primary/5 px-2 py-1 border border-crea-primary/10">
                            <MapPin className="w-3 h-3 mr-1.5" />
                            {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProgram && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#2C241B]/60 backdrop-blur-md">
          <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border-2 before:border-crea-accent/20 before:pointer-events-none rounded-sm shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto outline-none animate-in fade-in zoom-in-95 duration-200 border border-crea-accent/50">
            <div className="sticky top-0 bg-[#FAF8F5]/90 backdrop-blur-md px-8 py-5 border-b border-crea-accent/20 flex items-center justify-between z-10">
              <h3 className="text-xl font-display font-black text-crea-text uppercase tracking-widest">
                Pontozás <span className="mx-2 text-crea-accent">—</span> <span className="font-medium text-crea-primary">{selectedProgram.title}</span>
              </h3>
              <button 
                onClick={() => setSelectedProgram(null)}
                className="p-2 text-crea-muted hover:text-crea-primary hover:bg-crea-primary/10 transition-colors bg-white relative z-20 shadow-sm border border-crea-muted/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 pb-10 relative z-10">
              <PointsForm 
                initialCampDay={selectedProgram.day_number.toString()}
                initialNote={selectedProgram.title}
                onClose={() => setSelectedProgram(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
