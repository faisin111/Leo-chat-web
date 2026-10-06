import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';
import {
  LayoutDashboard,
  Users,
  Flag,
  MessageSquare,
  ShieldAlert,
  Settings,
  Shield,
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-background text-foreground overflow-hidden">
      <NavigationRail />

      {/* Admin Sidebar */}
      <aside className="w-full md:w-[280px] bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-border shrink-0 text-white md:h-full">
        <div className="p-4 md:p-6 pb-2 md:pb-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">Admin console</h2>
              <p className="text-xs text-slate-400">Platform owner workspace</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            <AdminNavItem
              to="/app/admin"
              icon={<LayoutDashboard className="w-4 h-4" />}
              label="Overview"
              active={location.pathname === '/app/admin'}
            />
            <AdminNavItem
              to="/app/admin/users"
              icon={<Users className="w-4 h-4" />}
              label="Users"
              active={location.pathname.startsWith('/app/admin/users')}
              badge="248"
            />
            <AdminNavItem
              to="/app/admin/reports"
              icon={<Flag className="w-4 h-4" />}
              label="Moderation"
              active={location.pathname.startsWith('/app/admin/reports')}
              badge="6"
              badgeColor="bg-red-500"
            />
            <AdminNavItem
              to="/app/admin/conversations"
              icon={<MessageSquare className="w-4 h-4" />}
              label="Conversations"
              active={location.pathname.startsWith('/app/admin/conversations')}
            />
            <AdminNavItem
              to="/app/admin/audit-logs"
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Audit logs"
              active={location.pathname.startsWith('/app/admin/audit-logs')}
            />
            <AdminNavItem
              to="/app/admin/ownership"
              icon={<Settings className="w-4 h-4" />}
              label="Platform settings"
              active={location.pathname.startsWith('/app/admin/ownership')}
            />
          </nav>
        </div>

        <div className="hidden md:block mt-auto p-6">
          <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50">
            <div className="flex items-center space-x-2 text-slate-300 mb-2 font-medium">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Privacy boundary</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Private messages are not readable by administrators. Only content attached to a user
              report may be reviewed.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-white relative overflow-hidden flex flex-col">
        <AnimatedOutlet />
      </main>
    </div>
  );
}

interface AdminNavItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  badgeColor?: string;
}

function AdminNavItem({
  to,
  icon,
  label,
  active,
  badge,
  badgeColor = 'bg-slate-700',
}: AdminNavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center md:justify-between px-4 py-2 md:px-3 md:py-2.5 rounded-full md:rounded-lg text-sm transition-colors whitespace-nowrap shrink-0 ${
        active
          ? 'bg-slate-800 text-white font-medium'
          : 'text-slate-400 bg-slate-800/50 md:bg-transparent hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`hidden md:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
