import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useSession, authSession, authApi } from '@/features/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export function NavigationRail() {
  const location = useLocation();
  const user = useSession((s) => s.user);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      toast.success('Successfully logged out', { duration: 3000 });
      authSession.expire();
    },
    onError: () => {
      toast.error('Session expired or error logging out');
      // Even if API call fails, force logout on frontend
      authSession.expire();
    }
  });

  return (
    <aside className="w-16 bg-slate-950 flex flex-col items-center py-4 border-r border-slate-900 z-20 shrink-0">
      {/* App Logo */}
      <Link to="/app" className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
        <MessageSquare className="w-5 h-5" fill="currentColor" />
      </Link>

      {/* Top Nav Items */}
      <nav className="flex-1 flex flex-col items-center gap-4 w-full">
        <NavItem 
          to="/app" 
          icon={<MessageSquare className="w-5 h-5" />} 
          active={location.pathname === '/app' || location.pathname.startsWith('/app/c/')} 
        />
        <NavItem 
          to="/app/people" 
          icon={<Users className="w-5 h-5" />} 
          active={location.pathname === '/app/people' || location.pathname === '/app/new' || location.pathname === '/app/new-group'} 
        />
        <NavItem 
          to="/app/settings" 
          icon={<Settings className="w-5 h-5" />} 
          active={location.pathname.startsWith('/app/settings')} 
        />
        {user?.role === 'ADMIN' && (
          <NavItem 
            to="/app/admin" 
            icon={<Shield className="w-5 h-5" />} 
            active={location.pathname.startsWith('/app/admin')} 
          />
        )}
      </nav>

      {/* Bottom Nav Items */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button 
          onClick={() => logoutMutation.mutate()}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        
        <Link 
          to="/app/settings/profile" 
          className="w-10 h-10 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0 hover:ring-2 ring-primary ring-offset-2 ring-offset-slate-950 transition-all"
        >
          {user?.displayName ? getInitials(user.displayName) : 'U'}
        </Link>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, active }: { to: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {active && (
        <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
      )}
      {icon}
    </Link>
  );
}
