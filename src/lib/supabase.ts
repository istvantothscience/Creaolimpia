import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zmzjnqvsywizojqoewus.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptempucXZzeXdpem9qcW9ld3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDM2MDUsImV4cCI6MjA4NTE3OTYwNX0.4BkgRZtm3bXu3utRzu-u4uhrthEhwoBO4kzeZMl6obQ';

console.log("Supabase URL loaded:", supabaseUrl);
console.log("Supabase Key loaded:", supabaseAnonKey ? "Yes, length: " + supabaseAnonKey.length : "No");

const isConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('YOUR_SUPABASE_URL');

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
