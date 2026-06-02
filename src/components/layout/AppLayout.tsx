import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Trophy, Home, ClipboardList, LogOut, Menu, X, Calendar } from 'lucide-react';
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

  const isOrganizer = profile?.role === 'teacher' || profile?.role === 'admin';

  const navItems = [
    { name: 'Ranglista', path: '/leaderboard', icon: Trophy, public: true },
    { name: 'Program', path: '/program', icon: Calendar, public: true },
    ...(profile?.role === 'student' ? [{ name: 'Csapatom', path: '/team', icon: Home, public: false }] : []),
    ...(isOrganizer ? [
      { name: 'Szervezői Pult', path: '/admin/dashboard', icon: ClipboardList, public: false },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-crea-bg flex flex-col font-sans text-crea-text">
      <nav className="bg-[#E8ECE3]/60 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 sticky top-0 z-50 shadow-[0_4px_30px_rgba(71,102,59,0.05)] supports-[backdrop-filter]:bg-[#E8ECE3]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                <div className="w-10 h-10 bg-crea-primary rounded-xl flex items-center justify-center text-white shadow-md">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="flex flex-col ml-1">
                  <span className="text-xl font-bold tracking-tight text-crea-text leading-none">Crea Olimpia</span>
                  <span className="text-[10px] font-bold text-crea-muted uppercase tracking-widest mt-0.5">2026</span>
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
                    "inline-flex items-center px-1 pt-1 text-sm font-semibold border-b-2 transition-colors",
                    location.pathname.startsWith(item.path)
                      ? "border-crea-primary text-crea-primary"
                      : "border-transparent text-stone-400 hover:border-stone-200 hover:text-stone-600"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              ))}
              
              {profile ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center text-sm font-medium text-stone-400 hover:text-stone-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Kilépés
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2 border border-transparent shadow-sm text-sm font-bold rounded-xl text-white bg-crea-primary hover:bg-crea-primary/90 transition-colors"
                >
                  Belépés
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "block pl-3 pr-4 py-2 border-l-4 text-base font-semibold",
                    location.pathname.startsWith(item.path)
                      ? "bg-crea-primary/5 border-crea-primary text-crea-primary"
                      : "border-transparent text-stone-500 hover:bg-stone-50 hover:border-stone-200 hover:text-stone-700"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                    {item.name}
                  </div>
                </Link>
              ))}
              
              {profile ? (
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-stone-500 hover:bg-stone-50 hover:border-stone-200 hover:text-stone-700"
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3 text-stone-400" />
                    Kilépés
                  </div>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block mx-3 my-2 text-center px-4 py-2 border border-transparent text-base font-bold rounded-xl text-white bg-crea-primary hover:bg-crea-primary/90"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Belépés
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
