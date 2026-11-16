import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { AiRotatingIcon } from '@/features/ai';
import { useSession, authSession, authApi, isAdminRole } from '@/features/auth';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
// eslint-disable-next-line no-restricted-imports
import { useUnreadCount } from '@/features/chat/api/use-unread-count';
import { useTheme } from 'next-themes';

export function NavigationRail() {
  const location = useLocation();
  const user = useSession((s) => s.user);
  const { data: unreadData } = useUnreadCount();
  const { resolvedTheme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    toast.info(`Switched to ${nextTheme} theme`);
  };

  const isConversationDetail = location.pathname.startsWith('/app/c/');

  return (
    <aside
      className={`${
        isConversationDetail ? 'hidden md:flex' : 'flex'
      } w-full md:w-16 h-16 md:h-full bg-slate-950 dark:bg-slate-950/95 flex-row md:flex-col items-center justify-around md:justify-between py-2 md:py-4 px-3 md:px-0 border-t md:border-t-0 md:border-r border-slate-900 z-30 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:pb-4 order-last md:order-first backdrop-blur-md`}
    >
      {/* App Logo (Desktop only) */}
      <Link
        to="/app"
        className="hidden md:flex w-10 h-10 bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground rounded-xl items-center justify-center mb-8 shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all duration-200"
        title="LeoChat Home"
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
          to="/app/ai"
          icon={<AiRotatingIcon size="nav" />}
          active={location.pathname.startsWith('/app/ai')}
          label="LeoChat AI"
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
      <div className="flex flex-row md:flex-col items-center gap-2 md:gap-3 shrink-0">
        {/* Quick Theme Switcher (Desktop) */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-slate-400 hover:text-amber-300 hover:bg-slate-900/80 active:scale-90 transition-all duration-200 cursor-pointer"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 transition-transform hover:-rotate-12" />
          )}
        </button>

        <button
          onClick={() => logoutMutation.mutate()}
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900/80 active:scale-90 transition-all duration-200 cursor-pointer"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <button
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/80 active:scale-90 transition-all duration-200 cursor-pointer"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <Link
          to="/app/settings/profile"
          className="relative w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 text-slate-900 dark:text-slate-100 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-primary/40 hover:ring-primary hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
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
      className={`relative w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-gradient-to-br from-primary/25 to-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/20'
          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
      }`}
    >
      {/* Desktop active pill (left edge) with glow */}
      {active && (
        <div className="hidden md:block absolute -left-[16px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] rounded-r-full shadow-sm shadow-primary" />
      )}
      {/* Mobile active indicator (top edge) */}
      {active && (
        <div className="md:hidden absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] rounded-full shadow-sm shadow-primary" />
      )}
      {icon}
      {!!badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-slate-950 shadow-md shadow-rose-500/40 animate-pulse">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </Link>
  );
}
