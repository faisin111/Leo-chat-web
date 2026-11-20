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
  QrCode,
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
  const showAdminTab = isAdminRole(user?.role) || location.pathname.startsWith('/app/admin');

  return (
    <aside
      className={`${
        isConversationDetail ? 'hidden md:flex' : 'flex'
      } fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto w-full md:w-16 h-16 md:h-full bg-card/95 md:bg-card border-t md:border-t-0 md:border-r border-border z-50 md:z-30 flex-row md:flex-col items-center justify-between py-1.5 md:py-4 px-2 sm:px-3 md:px-0 shrink-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:pb-4 order-last md:order-first backdrop-blur-xl shadow-lg md:shadow-none transition-colors duration-200`}
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
      <nav className="flex flex-row md:flex-col items-center justify-around md:justify-start gap-1 sm:gap-1.5 md:gap-4 flex-1 md:flex-initial md:w-full">
        <NavItem
          to="/app"
          icon={<MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />}
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
          icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
          active={
            location.pathname === '/app/people' ||
            location.pathname === '/app/new' ||
            location.pathname === '/app/new-group'
          }
          label="People"
        />
        <NavItem
          to="/app/qr"
          icon={<QrCode className="w-4 h-4 sm:w-5 sm:h-5" />}
          active={location.pathname === '/app/qr'}
          label="Web QR Code"
        />
        <NavItem
          to="/app/settings"
          icon={<Settings className="w-4 h-4 sm:w-5 sm:h-5" />}
          active={location.pathname.startsWith('/app/settings')}
          label="Settings"
        />
        {showAdminTab && (
          <NavItem
            to="/app/admin"
            icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />}
            active={location.pathname.startsWith('/app/admin')}
            label="Admin"
          />
        )}
      </nav>

      {/* Bottom Nav Items / Profile */}
      <div className="flex flex-row md:flex-col items-center gap-1 sm:gap-1.5 md:gap-3 shrink-0">
        {/* Quick Theme Switcher (Available on both Mobile & Desktop) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-xl text-muted-foreground hover:text-amber-500 hover:bg-muted active:scale-90 transition-all duration-200 cursor-pointer"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 transition-transform hover:rotate-45 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform hover:-rotate-12 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* Quick Logout (Available on both Mobile & Desktop) */}
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all duration-200 cursor-pointer"
          title="Log out"
          aria-label="Log out"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          type="button"
          className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted active:scale-90 transition-all duration-200 cursor-pointer"
          title="Help"
          aria-label="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <Link
          to="/app/settings/profile"
          className="relative w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-muted text-foreground border border-border rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ring-2 ring-primary/30 hover:ring-primary hover:scale-105 active:scale-95 transition-all duration-200 shadow-xs"
          title={user?.displayName || 'Profile'}
          aria-label="Profile"
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
      className={`relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 ${
        active
          ? 'bg-gradient-to-br from-primary/25 to-primary/10 text-primary border border-primary/20 shadow-xs shadow-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
      }`}
    >
      {/* Desktop active pill (left edge) with glow */}
      {active && (
        <div className="hidden md:block absolute -left-[16px] top-1/2 -translate-y-1/2 w-1.5 h-6 bg-gradient-to-b from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] rounded-r-full shadow-xs shadow-primary" />
      )}
      {/* Mobile active indicator (top edge) */}
      {active && (
        <div className="md:hidden absolute -top-1 left-1/2 -translate-x-1/2 w-5 sm:w-6 h-1 bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] rounded-full shadow-xs shadow-primary" />
      )}
      {icon}
      {!!badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold px-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-[18px] rounded-full flex items-center justify-center border-2 border-background shadow-xs shadow-rose-500/40 animate-pulse">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </Link>
  );
}
