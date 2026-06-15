import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Mail, Check, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Kérlek add meg az email címedet.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/profile',
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Hiba történt a jelszó visszaállítási kérelem során.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative z-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-crea-primary to-[#5A2315] rounded-none border border-crea-accent/50 flex items-center justify-center text-crea-accent shadow-[0_0_20px_rgba(207,160,82,0.4)]">
            <Mail className="w-8 h-8" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-black text-crea-text tracking-widest uppercase">
          Elfelejtett Jelszó
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-crea-primary uppercase tracking-[0.2em]">
          Új hozzáférés igénylése
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FAF8F5] relative before:absolute before:inset-2 before:border before:border-crea-accent/20 before:pointer-events-none py-10 px-6 shadow-[0_8px_30px_rgba(44,36,27,0.1)] sm:rounded-sm sm:px-12 border border-crea-accent/30">
          
          {success ? (
            <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center pb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-display font-bold text-crea-text uppercase tracking-widest">
                Email Elküldve
              </h3>
              <p className="text-sm font-medium text-crea-muted">
                Kérlek ellenőrizd a postafiókodat ({email}). A levélben található linkre kattintva beállíthatod az új jelszavadat. (A link a profiloldalra fog irányítani)
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full flex justify-center py-4 px-4 border border-crea-accent/30 text-sm font-bold uppercase tracking-widest text-crea-text hover:bg-stone-100 transition-colors"
              >
                Vissza a belépéshez
              </button>
            </div>
          ) : (
            <form className="space-y-8 relative z-10" onSubmit={handleReset}>
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-crea-text uppercase tracking-widest">
                  Regisztrált Email Cím
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
                    placeholder="diak@crea.hu"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-sm bg-red-50/80 border border-red-200 p-4">
                  <div className="text-sm text-red-800 font-medium text-center">{error}</div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-sm shadow-[0_4px_15px_rgba(140,58,39,0.2)] text-sm font-bold uppercase tracking-widest text-[#FDFBF7] bg-crea-primary hover:bg-[#5A2315] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Új jelszó kérése'}
                </button>
              </div>
              
              <div className="mt-6 text-center border-t border-crea-accent/20 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs font-bold uppercase tracking-widest text-crea-muted hover:text-crea-primary transition-colors flex items-center justify-center w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Vissza a belépéshez
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
