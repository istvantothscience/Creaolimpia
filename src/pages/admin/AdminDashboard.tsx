import { Link } from 'react-router-dom';
import { PlusCircle, Trophy, Activity, ClipboardList, Target } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const quickActions = [
    { name: 'Pontozás', path: '/admin/points', icon: Trophy, color: 'bg-crea-primary', description: 'Gyors pontadás csapatoknak' },
    { name: 'Programok', path: '/admin/program', icon: ClipboardList, color: 'bg-crea-muted', description: 'Napi beosztás kezelése' },
    { name: 'Szervező társak', path: '/admin/users', icon: Target, color: 'bg-stone-500', description: 'Jogosultságok', adminOnly: true },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-crea-text">Szervezői Pult</h1>
        <p className="mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest">Szia, {profile.name}! Válassz az alábbi lehetőségek közül.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          if (action.adminOnly && profile.role !== 'admin') return null;
          
          return (
            <Link
              key={action.name}
              to={action.path}
              className="relative group bg-white p-6 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-all hover:border-stone-200"
            >
              <div>
                <span className={`inline-flex rounded-xl p-3 ${action.color} text-white shadow-md`}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-bold text-crea-text">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-stone-400 uppercase tracking-widest">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute right-6 top-6 text-stone-200 group-hover:text-stone-300 transition-colors"
                aria-hidden="true"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
