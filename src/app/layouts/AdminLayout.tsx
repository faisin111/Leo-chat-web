import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/admin';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  LayoutDashboard,
  Users,
  Flag,
  MessageSquare,
  ShieldAlert,
  KeyRound,
  Shield,
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStatsOverview,
  });

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      <NavigationRail />

      {/* Admin Sidebar */}
      <aside className="w-full md:w-[280px] bg-card flex flex-col border-b md:border-b-0 md:border-r border-border shrink-0 text-card-foreground md:h-full transition-colors duration-200">
        <div className="p-3 sm:p-4 md:p-6 pb-2 md:pb-6">
          <div className="flex items-center space-x-3 mb-3 md:mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg leading-tight text-foreground">
                Admin Console
              </h2>
              <p className="text-xs text-muted-foreground">Platform management & security</p>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col space-x-1.5 md:space-x-0 md:space-y-1 overflow-x-auto pb-3 md:pb-0 hide-scrollbar">
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
              badge={
                statsLoading ? (
                  <Skeleton className="h-3 w-5 rounded-full bg-muted" />
                ) : stats?.totalUsers != null ? (
                  String(stats.totalUsers)
                ) : undefined
              }
            />
            <AdminNavItem
              to="/app/admin/reports"
              icon={<Flag className="w-4 h-4" />}
              label="Moderation"
              active={location.pathname.startsWith('/app/admin/reports')}
              badge={
                statsLoading ? (
                  <Skeleton className="h-3 w-5 rounded-full bg-muted" />
                ) : stats?.totalReports != null ? (
                  String(stats.totalReports)
                ) : undefined
              }
              badgeColor="bg-destructive text-destructive-foreground"
            />
            <AdminNavItem
              to="/app/admin/conversations"
              icon={<MessageSquare className="w-4 h-4" />}
              label="Conversations"
              active={location.pathname.startsWith('/app/admin/conversations')}
              badge={
                statsLoading ? (
                  <Skeleton className="h-3 w-5 rounded-full bg-muted" />
                ) : stats?.totalConversations != null ? (
                  String(stats.totalConversations)
                ) : undefined
              }
            />
            <AdminNavItem
              to="/app/admin/audit-logs"
              icon={<ShieldAlert className="w-4 h-4" />}
              label="Audit Logs"
              active={location.pathname.startsWith('/app/admin/audit-logs')}
            />
            <AdminNavItem
              to="/app/admin/ownership"
              icon={<KeyRound className="w-4 h-4" />}
              label="Transfer Ownership"
              active={location.pathname.startsWith('/app/admin/ownership')}
            />
          </nav>
        </div>

        <div className="hidden md:block mt-auto p-6">
          <div className="p-4 rounded-xl border border-border bg-muted/40">
            <div className="flex items-center space-x-2 text-foreground mb-2 font-medium">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm">Privacy boundary</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Private messages are not readable by administrators. Only content attached to a user
              report may be reviewed.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-background relative overflow-y-auto flex flex-col pb-16 md:pb-0">
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
  badge?: ReactNode;
  badgeColor?: string;
}

function AdminNavItem({
  to,
  icon,
  label,
  active,
  badge,
  badgeColor = 'bg-muted text-muted-foreground',
}: AdminNavItemProps) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-center md:justify-between px-3.5 py-2 md:px-3.5 md:py-2.5 rounded-full md:rounded-xl text-xs sm:text-sm transition-all duration-200 whitespace-nowrap shrink-0 active:scale-[0.98] ${
        active
          ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/25 font-semibold shadow-xs'
          : 'text-muted-foreground bg-muted/60 md:bg-transparent hover:bg-muted hover:text-foreground'
      }`}
    >
      <div className="flex items-center space-x-2 md:space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`inline-flex items-center justify-center ml-1.5 md:ml-2 text-[10px] font-bold px-1.5 md:px-2 py-0.5 rounded-full ${badgeColor}`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
