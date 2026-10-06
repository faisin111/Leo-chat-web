import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedOutlet } from './AnimatedOutlet';
import { User, MonitorSmartphone, Shield, Ban, Palette } from 'lucide-react';
import { useSession } from '@/features/auth';

export default function SettingsLayout() {
  const location = useLocation();
  const user = useSession((s) => s.user);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-slate-50/50">
      {/* Settings Sidebar */}
      <aside className="w-full md:w-[300px] border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col shrink-0 md:h-full">
        <div className="p-4 md:p-6 pb-0 md:pb-6">
          <h2 className="text-xl font-semibold mb-4 md:mb-6">Settings</h2>

          <div className="hidden md:flex items-center space-x-3 p-3 rounded-xl border border-slate-100 shadow-sm mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
              {user?.displayName ? getInitials(user.displayName) : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user?.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.username || '@username'}</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
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
          <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-800">
            <p className="text-xs font-bold mb-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Account ACTIVE
            </p>
            <p className="text-[10px] opacity-80">Member since {new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
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
      className={`flex items-center justify-center md:justify-between px-4 py-2 md:px-3 md:py-2.5 rounded-full md:rounded-lg text-sm transition-colors font-medium whitespace-nowrap shrink-0 ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-slate-600 bg-slate-100 md:bg-transparent hover:bg-slate-200 md:hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`hidden md:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-slate-200 text-slate-700'}`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
