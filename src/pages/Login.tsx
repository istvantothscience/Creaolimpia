import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Landmark } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { profile } = useAuth();

  // If already logged in, redirect
  if (profile) {
    if (profile.role === 'admin' || profile.role === 'teacher') {
      navigate('/admin/dashboard');
    } else {
      navigate('/team');
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!supabase) {
      setError('A Supabase nincs megfelelően konfigurálva. Kérlek ellenőrizd az API kulcsokat a környezeti változók között.');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('Login successful, checking role...');

      // Check role after login
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileData?.role === 'admin' || profileData?.role === 'teacher') {
        navigate('/admin/dashboard');
      } else {
        navigate('/team');
      }

    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setError('Hibás email vagy jelszó.');
      } else if (err.message === 'Email logins are disabled') {
        setError('Az email alapú bejelentkezés ki van kapcsolva. Kérlek engedélyezd a Supabase Dashboardon: Authentication -> Providers -> Email -> Enable Email provider.');
      } else if (err.message === 'Failed to fetch') {
        setError('Hálózati hiba (Failed to fetch). Ellenőrizd: 1. Nincs-e bekapcsolva AdBlocker/Brave Shield (kapcsold ki!). 2. Nyisd meg az appot új lapon (jobb felső sarok gomb). 3. Supabase Authentication -> URL Configuration beállítások.');
      } else {
        setError(err.message || 'Váratlan hiba történt a bejelentkezés során.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-crea-primary to-[#5A2315] rounded-none border border-crea-accent/50 flex items-center justify-center text-crea-accent shadow-[0_0_20px_rgba(207,160,82,0.4)]">
            <Landmark className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-black text-crea-text tracking-widest uppercase">
          Belépés az Agorára
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-crea-primary uppercase tracking-[0.3em]">
          Crea Olimpia MMXXVI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none py-10 px-6 shadow-[0_8px_30px_rgba(44,36,27,0.1)] sm:rounded-sm sm:px-12 border border-crea-accent/30">
          <form className="space-y-8 relative z-10" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-crea-text uppercase tracking-widest">
                Polgár (Email)
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-5 py-4 border border-crea-accent/30 rounded-sm bg-[#FDFBF7] shadow-inner placeholder-crea-muted focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary sm:text-sm font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-crea-text uppercase tracking-widest">
                Titkos Jelszó
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-5 py-4 border border-crea-accent/30 rounded-sm bg-[#FDFBF7] shadow-inner placeholder-crea-muted focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary sm:text-sm font-medium transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-sm bg-red-50/80 border border-red-200 p-4">
                <div className="text-sm text-red-800 font-medium">{error}</div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-[0_4px_15px_rgba(140,58,39,0.2)] text-sm font-bold uppercase tracking-widest text-[#FDFBF7] bg-crea-primary hover:bg-[#5A2315] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Belépés folyamatban...' : 'Belépés'}
              </button>
            </div>
            
            <div className="mt-4 flex items-center justify-center">
               <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-bold uppercase tracking-wider text-crea-primary hover:text-[#5A2315] transition-colors"
                >
                 Elfelejtett jelszó?
               </button>
            </div>
            
            <div className="mt-6 text-center border-t border-crea-accent/20 pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-bold uppercase tracking-widest text-crea-muted hover:text-crea-primary transition-colors flex items-center justify-center w-full"
              >
                Vissza az Olimpia Programjához
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
