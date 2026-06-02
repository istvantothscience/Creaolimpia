import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { WeeklyProgram } from '@/types/database';

export default function ProgramPage() {
  const [items, setItems] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-crea-primary"></div></div>;

  // Group by day_number
  const groupedItems = items.reduce((acc, item) => {
    const day = item.day_number;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {} as Record<number, WeeklyProgram[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-crea-text tracking-tight">Tábori Program</h1>
        <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest">A Crea Olimpia hivatalos eseményei</p>
      </div>

      {Object.keys(groupedItems).length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-12 text-center text-stone-500">
          Még nincsenek feltöltött programok.
        </div>
      ) : (
        <div className="space-y-8">
          {(Object.entries(groupedItems) as [string, WeeklyProgram[]][]).map(([day, dayItems]) => (
            <div key={day}>
              <h2 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4 sticky top-16 bg-crea-bg py-3 z-10 transition-colors">
                {day}. Nap
              </h2>
              
              <div className="space-y-4">
                {dayItems.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 flex flex-col sm:flex-row sm:items-center hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-32 border-r-2 border-stone-50 pb-4 sm:pb-0 sm:pr-4 mb-4 sm:mb-0 relative py-2">
                       <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-stone-200 sm:hidden"></div>
                      <div className="flex items-center text-crea-primary font-black text-lg">
                        {item.start_time?.slice(0, 5) || 'Egész nap'}
                      </div>
                      {item.end_time && (
                        <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mt-1">
                          - {item.end_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 sm:px-6">
                      <h3 className="text-lg font-bold text-crea-text">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-sm text-stone-500">{item.description}</p>
                      )}
                      
                      <div className="mt-3 flex items-center space-x-4">
                        {item.location && (
                          <div className="flex items-center text-xs font-bold text-stone-400 uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
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
    </div>
  );
}
