import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Trophy, Home, ClipboardList, LogOut, Menu, X, Calendar, Landmark, Flame, User, Users, BarChart } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Láng', path: '/flame', icon: Flame, public: true },
    { name: 'Ranglista', path: '/leaderboard', icon: Trophy, public: true },
    { name: 'Egyéni rangsor', path: '/individual-leaderboard', icon: User, public: true },
    { name: 'Program', path: '/program', icon: Calendar, public: true },
    ...(profile?.role === 'student' ? [{ name: 'Csapatom', path: '/team', icon: Home, public: false }] : []),
  ];

  const homePath = profile?.role === 'admin' || profile?.role === 'teacher' ? '/admin/dashboard' : '/leaderboard';

  return (
    <div className="min-h-screen bg-transparent flex flex-col font-sans text-crea-text relative">
      <nav className="bg-[#F5F2E9]/80 backdrop-blur-xl backdrop-saturate-150 border-b-2 border-crea-accent/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to={homePath} className="flex-shrink-0 flex items-center space-x-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-crea-primary to-[#5A2315] rounded-none border border-crea-accent/50 flex items-center justify-center text-crea-accent shadow-[0_0_15px_rgba(207,160,82,0.3)] group-hover:scale-105 transition-transform duration-300">
                  <Landmark className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display tracking-widest text-[#2C241B] leading-none uppercase">Crea Olimpia</span>
                  <span className="text-[10px] font-bold text-crea-primary uppercase tracking-[0.3em] mt-1 pl-0.5">MMXXVI</span>
                </div>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <div className="hidden sm:flex sm:items-center sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 text-sm font-semibold border-b-2 transition-all duration-300 uppercase tracking-widest",
                    location.pathname.startsWith(item.path)
                      ? "border-crea-primary text-crea-primary"
                      : "border-transparent text-crea-muted hover:border-crea-accent/50 hover:text-crea-primary"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2 mb-0.5" />
                  {item.name}
                </Link>
              ))}
              
              {profile ? (
                <div className="flex items-center space-x-6">
                  {(profile.role === 'admin' || profile.role === 'teacher') && (
                    <Link
                      to="/admin/dashboard"
                      className="inline-flex items-center text-sm font-bold uppercase tracking-[0.2em] text-crea-primary hover:text-[#5A2315] transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 mr-2" />
                      Szervezői Agora
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="inline-flex items-center text-sm font-semibold uppercase tracking-widest text-crea-muted hover:text-crea-primary transition-colors"
                  >
                    Profil
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center text-sm font-semibold uppercase tracking-widest text-crea-muted hover:text-crea-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Kilépés
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 py-2 border border-crea-accent shadow-sm text-sm font-bold uppercase tracking-widest text-white bg-crea-primary hover:bg-[#5A2315] transition-colors"
                >
                  Belépés
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 text-crea-primary hover:text-[#5A2315]"
              >
                <span className="sr-only">Menü megnyitása</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t-2 border-crea-accent/10 bg-[#F5F2E9]">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block pl-3 pr-4 py-3 border-l-4 text-sm font-semibold uppercase tracking-widest",
                    location.pathname.startsWith(item.path)
                      ? "bg-crea-primary/5 border-crea-primary text-crea-primary"
                      : "border-transparent text-crea-text hover:bg-stone-50/50 hover:border-crea-accent/30"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3 text-crea-accent" />
                    {item.name}
                  </div>
                </Link>
              ))}
              
              {profile ? (
                <>
                  {(profile.role === 'admin' || profile.role === 'teacher') && (
                    <Link
                      to="/admin/dashboard"
                      className="block w-full text-left pl-3 pr-4 py-3 border-l-4 border-transparent text-sm font-bold uppercase tracking-widest text-crea-primary hover:bg-stone-50/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <ClipboardList className="w-5 h-5 mr-3 text-crea-primary" />
                        Szervezői Agora
                      </div>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="block w-full text-left pl-3 pr-4 py-3 border-l-4 border-transparent text-sm font-semibold uppercase tracking-widest text-crea-text hover:bg-stone-50/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-3 text-crea-accent" />
                      Profil
                    </div>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left pl-3 pr-4 py-3 border-l-4 border-transparent text-sm font-semibold uppercase tracking-widest text-crea-text hover:bg-stone-50/50"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-5 h-5 mr-3 text-crea-accent" />
                      Kilépés
                    </div>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block mx-3 my-2 text-center px-4 py-3 border border-crea-accent text-sm font-bold uppercase tracking-widest text-white bg-crea-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Belépés
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 z-10 relative">
        <Outlet />
      </main>
    </div>
  );
}
