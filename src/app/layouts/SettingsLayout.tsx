import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedOutlet } from './AnimatedOutlet';
import { User, MonitorSmartphone, Shield, Ban, Palette } from 'lucide-react';
import { useSession } from '@/features/auth';
import { env } from '@/shared/config/env';

export default function SettingsLayout() {
  const location = useLocation();
  const user = useSession((s) => s.user);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-background">
      {/* Settings Sidebar */}
      <aside className="w-full md:w-[300px] border-b md:border-b-0 md:border-r border-border bg-card flex flex-col shrink-0 md:h-full">
        <div className="p-4 md:p-6 pb-0 md:pb-6">
          <h2 className="text-xl font-bold tracking-tight text-foreground mb-4 md:mb-6 flex items-center gap-2">
            <span>Settings</span>
            <span className="w-2 h-2 rounded-full bg-primary" />
          </h2>

          <div className="hidden md:flex items-center space-x-3 p-3 rounded-2xl border border-border/70 bg-muted/40 dark:bg-slate-900/40 shadow-xs mb-6 backdrop-blur-xs">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold shadow-xs">
              {user?.displayName ? getInitials(user.displayName) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-foreground truncate">
                {user?.displayName || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.username || '@username'}
              </p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            <SettingsNavItem
              to="/app/settings/profile"
              icon={<User className="w-4 h-4" />}
              label="Profile"
              active={location.pathname.startsWith('/app/settings/profile')}
            />
            <SettingsNavItem
              to="/app/settings/sessions"
              icon={<MonitorSmartphone className="w-4 h-4" />}
              label="Sessions"
              active={location.pathname.startsWith('/app/settings/sessions')}
              badge="3"
            />
            <SettingsNavItem
              to="/app/settings/security"
              icon={<Shield className="w-4 h-4" />}
              label="Security"
              active={location.pathname.startsWith('/app/settings/security')}
            />
            <SettingsNavItem
              to="/app/settings/blocked"
              icon={<Ban className="w-4 h-4" />}
              label="Blocked"
              active={location.pathname.startsWith('/app/settings/blocked')}
            />
            <SettingsNavItem
              to="/app/settings/appearance"
              icon={<Palette className="w-4 h-4" />}
              label="Appearance"
              active={location.pathname.startsWith('/app/settings/appearance')}
            />
          </nav>
        </div>

        <div className="hidden md:block mt-auto p-6">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
            <p className="text-xs font-bold mb-1 flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Account ACTIVE
            </p>
            <p className="text-[10px] opacity-80">
              Connected securely · LeoChat Pro v{env.APP_VERSION}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <AnimatedOutlet />
      </main>
    </div>
  );
}

function SettingsNavItem({
  to,
  icon,
  label,
  active,
  badge,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center md:justify-between px-4 py-2 md:px-3.5 md:py-2.5 rounded-full md:rounded-xl text-sm transition-all duration-200 font-medium whitespace-nowrap shrink-0 active:scale-[0.98] ${
        active
          ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary border border-primary/20 font-semibold shadow-xs'
          : 'text-muted-foreground bg-muted/50 md:bg-transparent hover:bg-muted hover:text-foreground'
      }`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`hidden md:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            active
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
