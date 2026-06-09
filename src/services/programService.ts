import { supabase } from '@/lib/supabase';
import { WeeklyProgramEvent, ProgramScoreEntryInput } from '@/types/database';

export const programService = {
  async getWeeklyProgram() {
    const { data, error } = await supabase
      .from('weekly_program_view')
      .select('*')
      .order('program_date', { ascending: true })
      .order('display_order', { ascending: true });
      
    if (error) throw error;
    return data as WeeklyProgramEvent[];
  },

  async createProgramScoreEntry(entry: ProgramScoreEntryInput) {
    const { data, error } = await supabase
      .from('program_score_entries')
      .insert([entry])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
