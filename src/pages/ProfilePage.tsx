import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { User, Key, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { profile } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('A két jelszó nem egyezik.');
      return;
    }
    if (newPassword.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.message === 'User not found' ? 'Felhasználó nem található.' : 'Hiba történt a jelszó módosításakor.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center p-12">
        <span className="text-crea-muted uppercase font-bold tracking-widest text-xs">Kérlek lépj be...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-16">
      <div className="text-center space-y-4 pt-8">
        <User className="w-12 h-12 mx-auto text-crea-primary opacity-80" />
        <h1 className="text-4xl sm:text-5xl font-display font-black text-crea-text tracking-widest uppercase">Profilom</h1>
        <p className="text-sm font-bold text-crea-muted uppercase tracking-[0.2em] mt-2 flex items-center justify-center">
          <span className="w-12 h-px bg-crea-accent/30 mr-4"></span>
          Fiók beállítások
          <span className="w-12 h-px bg-crea-accent/30 ml-4"></span>
        </p>
      </div>

      <div className="bg-[#FAF8F5] border border-crea-accent/30 p-8 sm:p-12 relative overflow-hidden">
        <div className="flex flex-col space-y-2 mb-8 pb-8 border-b border-crea-accent/20">
          <span className="text-xs font-bold uppercase tracking-widest text-crea-muted">Szerepkör</span>
          <span className="text-xl font-display font-bold uppercase tracking-wide text-crea-text">
            {profile.role === 'admin' ? 'Adminisztrátor' : profile.role === 'teacher' ? 'Szervező / Tanár' : 'Résztvevő / Diák'}
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-crea-primary" />
            <h2 className="text-2xl font-display font-bold uppercase tracking-widest text-crea-text">Jelszó Csere</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 border border-red-200 text-sm font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-800 py-6 px-4 border border-green-200 flex flex-col items-center justify-center space-y-3">
              <Check className="w-8 h-8 text-green-600" />
              <div className="text-sm font-bold text-green-800 uppercase tracking-widest text-center">
                Sikeres jelszócsere!
              </div>
            </div>
          )}

          {!success && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-crea-text mb-3">
                  Új jelszó
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-crea-text mb-3">
                  Jelszó megerősítése
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-5 py-4 text-sm font-medium border border-crea-accent/30 focus:outline-none focus:ring-1 focus:ring-crea-primary focus:border-crea-primary rounded-sm bg-[#FDFBF7] transition-colors shadow-inner"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-4 border-t border-crea-accent/20">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent shadow-sm text-sm font-bold uppercase tracking-widest text-white bg-crea-primary hover:bg-[#5A2315] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crea-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Jelszó mentése'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
