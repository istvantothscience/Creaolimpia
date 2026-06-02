import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Trophy } from 'lucide-react';
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
    <div className="min-h-screen bg-crea-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-crea-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black text-crea-text tracking-tight">
          Crea Olimpia
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-crea-muted uppercase tracking-widest">
          2026
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-3xl sm:px-10 border border-stone-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                Email cím
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-2xl bg-stone-50/50 shadow-sm placeholder-stone-400 focus:outline-none focus:ring-crea-primary focus:border-crea-primary sm:text-sm font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-stone-400 uppercase tracking-wider">
                Jelszó
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-stone-200 rounded-2xl bg-stone-50/50 shadow-sm placeholder-stone-400 focus:outline-none focus:ring-crea-primary focus:border-crea-primary sm:text-sm font-medium transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-crea-primary hover:bg-crea-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Bejelentkezés folyamatban...' : 'Belépés'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm font-bold text-stone-500 hover:text-stone-700 transition-colors"
              >
                Vissza a főoldalra (Ranglista)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
