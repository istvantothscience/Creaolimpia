import { Link } from 'react-router-dom';
import { PlusCircle, Crown, Activity, Scroll, Sword, Medal, Users } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import TeamIndividualScoreSummary from '@/components/TeamIndividualScoreSummary';

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const quickActions = [
    { name: 'Pontozás', path: '/admin/points', icon: Crown, color: 'bg-crea-primary', description: 'Urald a Drachmákat' },
    { name: 'Egyéni Pontozás', path: '/admin/individual-scores', icon: Medal, color: 'bg-[#B17A44]', description: 'Egyéni Teljesítmények' },
    { name: 'Események', path: '/admin/program', icon: Scroll, color: 'bg-crea-muted', description: 'Az Olimpia Krónikája' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      <div className="pt-8">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-widest text-crea-text uppercase">Szervezői Agora</h1>
        <p className="mt-2 text-sm font-bold text-crea-muted uppercase tracking-[0.2em]">Üdvözlet, {profile.name}! Válassz az alábbi teendők közül.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          if (action.adminOnly && profile.role !== 'admin') return null;
          
          return (
            <Link
              key={action.name}
              to={action.path}
              className="relative group bg-[#FAF8F5] p-8 rounded-sm shadow-[0_4px_15px_rgba(44,36,27,0.05)] border border-crea-accent/30 hover:shadow-[0_8px_30px_rgba(207,160,82,0.15)] hover:border-crea-accent/60 transition-all duration-300 overflow-hidden before:absolute before:inset-2 before:border before:border-crea-accent/10 before:pointer-events-none"
            >
              <div className="relative z-10">
                <span className={`inline-flex rounded-sm p-4 ${action.color} text-white shadow-md border border-black/10`}>
                  <action.icon className="h-6 w-6" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-8 relative z-10">
                <h3 className="text-2xl font-display font-medium text-crea-text uppercase tracking-widest">
                  <span className="absolute inset-0" aria-hidden="true" />
                  {action.name}
                </h3>
                <p className="mt-2 text-xs font-bold text-crea-muted uppercase tracking-[0.2em]">
                  {action.description}
                </p>
              </div>
              <span
                className="pointer-events-none absolute right-8 top-8 text-crea-accent/20 group-hover:text-crea-accent/50 transition-colors duration-300"
                aria-hidden="true"
              >
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>
      
      <div className="pt-12">
        <TeamIndividualScoreSummary />
      </div>
    </div>
  );
}
