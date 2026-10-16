import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, Settings, Shield, HelpCircle, LogOut } from 'lucide-react';
import { useSession, authSession, authApi, isAdminRole } from '@/features/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
// eslint-disable-next-line no-restricted-imports
import { useUnreadCount } from '@/features/chat/api/use-unread-count';

export function NavigationRail() {
  const location = useLocation();
  const user = useSession((s) => s.user);
  const { data: unreadData } = useUnreadCount();

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
    },
  });

  const isConversationDetail = location.pathname.startsWith('/app/c/');

  return (
    <aside
      className={`${
        isConversationDetail ? 'hidden md:flex' : 'flex'
      } w-full md:w-16 h-16 md:h-full bg-slate-950 flex-row md:flex-col items-center justify-around md:justify-between py-2 md:py-4 px-3 md:px-0 border-t md:border-t-0 md:border-r border-slate-900 z-30 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:pb-4 order-last md:order-first`}
    >
      {/* App Logo (Desktop only) */}
      <Link
        to="/app"
        className="hidden md:flex w-10 h-10 bg-primary text-primary-foreground rounded-xl items-center justify-center mb-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
      >
        <MessageSquare className="w-5 h-5" fill="currentColor" />
      </Link>

      {/* Primary Nav Items: horizontal on mobile, vertical column on desktop */}
      <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 md:gap-4 w-full flex-1">
        <NavItem
          to="/app"
          icon={<MessageSquare className="w-5 h-5" />}
          active={location.pathname === '/app' || location.pathname.startsWith('/app/c/')}
          badge={unreadData?.unreadCount}
          label="Chats"
        />
        <NavItem
          to="/app/people"
          icon={<Users className="w-5 h-5" />}
          active={
            location.pathname === '/app/people' ||
            location.pathname === '/app/new' ||
            location.pathname === '/app/new-group'
          }
          label="People"
        />
        <NavItem
          to="/app/settings"
          icon={<Settings className="w-5 h-5" />}
          active={location.pathname.startsWith('/app/settings')}
          label="Settings"
        />
        {isAdminRole(user?.role) && (
          <NavItem
            to="/app/admin"
            icon={<Shield className="w-5 h-5" />}
            active={location.pathname.startsWith('/app/admin')}
            label="Admin"
          />
        )}
      </nav>

      {/* Bottom Nav Items / Profile */}
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-4 shrink-0">
        <button
          onClick={() => logoutMutation.mutate()}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <button
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <Link
          to="/app/settings/profile"
          className="w-10 h-10 bg-slate-200 text-slate-800 rounded-full flex items-center justify-center font-bold text-sm shrink-0 hover:ring-2 ring-primary ring-offset-2 ring-offset-slate-950 transition-all"
          title={user?.displayName || 'Profile'}
        >
          {user?.displayName ? getInitials(user.displayName) : 'U'}
        </Link>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  active,
  badge,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  label?: string;
}) {
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className={`relative w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 ${
        active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {/* Desktop active pill (left edge) */}
      {active && (
        <div className="hidden md:block absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
      )}
      {/* Mobile active indicator (top edge) */}
      {active && (
        <div className="md:hidden absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
      )}
      {icon}
      {!!badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-slate-950">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </Link>
  );
}
