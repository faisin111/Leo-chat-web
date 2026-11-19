import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin';
import { useRealtimeStatus } from '@/shared/api/use-realtime-status';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Users,
  MessageSquare,
  Flag,
  ShieldAlert,
  ArrowUpRight,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRealtimeConnected = useRealtimeStatus();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStatsOverview,
  });

  const { data: recentReports, isLoading: reportsLoading } = useQuery({
    queryKey: ['admin-reports-preview'],
    queryFn: () => adminApi.getReports(),
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-logs-preview'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-reports-preview'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-logs-preview'] }),
    ]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 h-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Admin Overview
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Role Admin
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time platform telemetry, moderation queue, and system audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-xl bg-white shadow-xs border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin text-primary' : 'text-slate-500'}`}
            />
            Sync
          </Button>
          <Button asChild size="sm" className="rounded-xl shadow-xs">
            <Link to="/app/admin/reports">
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Review Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <Link
          to="/app/admin/users"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                (stats?.totalUsers ?? 0).toLocaleString()
              )}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Platform registered accounts</p>
        </Link>

        <Link
          to="/app/admin/conversations"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-primary/40 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Conversations
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                (stats?.totalConversations ?? 0).toLocaleString()
              )}
            </div>
            <span className="text-xs font-medium text-slate-400">Direct & Groups</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">All direct and group chats</p>
        </Link>

        <Link
          to="/app/admin/reports"
          className="group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-300 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Reports
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                (stats?.totalReports ?? 0) > 0
                  ? 'bg-red-50 text-red-600'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div
              className={`text-2xl sm:text-3xl font-bold ${
                (stats?.totalReports ?? 0) > 0 ? 'text-red-600' : 'text-slate-900'
              }`}
            >
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (stats?.totalReports ?? 0).toLocaleString()
              )}
            </div>
            {(stats?.totalReports ?? 0) > 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                Action required
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600 flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                Clear
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Reported messages & users</p>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Connection
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isRealtimeConnected && !statsError
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {isRealtimeConnected && !statsError ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className={statsError ? 'text-amber-700' : 'text-slate-900'}>
              API: {statsLoading ? 'checking…' : statsError ? 'unreachable' : 'reachable'}
            </p>
            <p className={isRealtimeConnected ? 'text-slate-900' : 'text-amber-700'}>
              Realtime: {isRealtimeConnected ? 'connected' : 'disconnected'}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-1">As seen from this browser</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mb-8">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Quick Admin Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button asChild variant="outline" size="sm" className="justify-start text-xs rounded-xl">
            <Link to="/app/admin/users">
              <Users className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Users
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start text-xs rounded-xl">
            <Link to="/app/admin/reports">
              <Flag className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Reports
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start text-xs rounded-xl">
            <Link to="/app/admin/audit-logs">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Audit
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="justify-start text-xs rounded-xl">
            <Link to="/app/admin/ownership">
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Ownership
            </Link>
          </Button>
        </div>
      </div>

      {/* Live Recent Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports Queue Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Reports</h2>
              <p className="text-xs text-slate-500">Moderation requests requiring review</p>
            </div>
            <Link
              to="/app/admin/reports"
              className="text-xs font-semibold text-primary hover:underline flex items-center"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {reportsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-2.5 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16 rounded-full shrink-0 ml-2" />
                </div>
              ))
            ) : recentReports?.items && recentReports.items.length > 0 ? (
              recentReports.items.slice(0, 4).map((report) => (
                <Link
                  key={report.id}
                  to={`/app/admin/reports/${report.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-slate-50/80 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {report.reason} · {report.targetType}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {report.details || 'No additional details provided'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0 ml-2">
                    {report.status}
                  </span>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                No pending moderation reports
              </div>
            )}
          </div>
        </div>

        {/* Audit Trail Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Security Audit Trail</h2>
              <p className="text-xs text-slate-500">Latest administrative events</p>
            </div>
            <Link
              to="/app/admin/audit-logs"
              className="text-xs font-semibold text-primary hover:underline flex items-center"
            >
              View logs <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {logsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-2.5 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16 shrink-0 ml-2" />
                </div>
              ))
            ) : recentLogs?.items && recentLogs.items.length > 0 ? (
              recentLogs.items.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 font-mono truncate">
                        {log.action}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Actor: {log.actorId || log.actor || 'System'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                    {log.createdAt ? format(new Date(log.createdAt), 'MMM d, HH:mm') : '—'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No recent audit log entries
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
