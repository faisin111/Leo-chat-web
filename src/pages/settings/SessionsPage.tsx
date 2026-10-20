import { Button } from '@/shared/ui/button';
import {
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  AlertTriangle,
  Globe,
  Clock,
  Calendar,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { useSessions, useRevokeSession, type SessionItem } from '@/features/users';
import { formatDistanceToNow, format } from 'date-fns';

function safeFormatDistance(dateStr?: string | null, fallback = 'Unknown'): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return fallback;
  }
}

function safeFormatDate(dateStr?: string | null, fallback = '—'): string {
  if (!dateStr) return fallback;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return fallback;
    return format(d, 'MMM d, yyyy');
  } catch {
    return fallback;
  }
}

function getPlatformInfo(platform?: string | null, ua?: string | null) {
  const normPlatform = (platform || '').trim().toLowerCase();
  const userAgent = ua || '';

  let os = 'Unknown OS';
  if (
    normPlatform === 'ios' ||
    userAgent.includes('iPhone') ||
    userAgent.includes('iPad') ||
    userAgent.includes('iOS')
  ) {
    os = 'iOS';
  } else if (normPlatform === 'android' || userAgent.includes('Android')) {
    os = 'Android';
  } else if (
    normPlatform === 'macos' ||
    normPlatform === 'mac' ||
    userAgent.includes('Mac OS') ||
    userAgent.includes('Macintosh')
  ) {
    os = 'macOS';
  } else if (normPlatform === 'windows' || userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (normPlatform === 'linux' || userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (normPlatform === 'web') {
    os = 'Web';
  }

  let browser = '';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';

  const isMobile =
    os === 'iOS' || os === 'Android' || normPlatform === 'ios' || normPlatform === 'android';
  const isTablet = userAgent.includes('iPad') || userAgent.includes('Tablet');

  return { os, browser, isMobile, isTablet };
}

export const SessionsPage = () => {
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeSession = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    revokeSession.mutate(sessionId);
  };

  const activeCount = sessions?.filter((s) => s.active !== false && !s.logoutAt).length ?? 0;

  return (
    <div className="max-w-3xl w-full mx-auto p-6 sm:p-8 overflow-y-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sessions & Devices</h1>
            {!isLoading && sessions && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {activeCount} active
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            Manage browser sessions and devices currently signed into your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && <SessionsSkeleton />}

        {isError && (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center text-sm font-medium">
            Failed to load sessions. Please try refreshing the page.
          </div>
        )}

        {!isLoading && !isError && sessions?.length === 0 && (
          <div className="p-10 bg-white text-slate-500 rounded-2xl border border-slate-200 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 text-base mb-1">No active sessions</h3>
            <p className="text-sm text-slate-400">There are no devices or sessions on record.</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          sessions?.map((session: SessionItem) => {
            const { os, browser, isMobile, isTablet } = getPlatformInfo(
              session.platform,
              session.userAgent || session.deviceInfo,
            );

            const DeviceIcon = isTablet
              ? Tablet
              : isMobile
                ? Smartphone
                : os === 'macOS' || os === 'Windows' || os === 'Linux'
                  ? Laptop
                  : Monitor;

            const primaryTitle =
              session.deviceName?.trim() ||
              (browser ? `${os} · ${browser}` : os !== 'Unknown OS' ? os : 'Client Session');

            const secondarySubtitle =
              session.deviceName?.trim() && (browser || os !== 'Unknown OS')
                ? browser
                  ? `${os} · ${browser}`
                  : os
                : null;

            const isActive = session.active !== false && !session.logoutAt;
            const isRevokingThisSession =
              revokeSession.isPending && revokeSession.variables === session.sessionId;

            return (
              <div
                key={session.sessionId}
                className={`p-5 sm:p-6 bg-white rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
                  isActive
                    ? 'border-slate-200 hover:border-slate-300'
                    : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Device Icon & Information */}
                  <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      <DeviceIcon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900 text-base leading-tight truncate">
                          {primaryTitle}
                        </h3>

                        {/* Active / Inactive Badge */}
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Signed out
                          </span>
                        )}

                        {/* Platform Badge */}
                        {session.platform && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {session.platform.toUpperCase()}
                          </span>
                        )}

                        {/* App Version Badge */}
                        {session.appVersion && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {`v${session.appVersion}`}
                          </span>
                        )}
                      </div>

                      {/* Subtitle if deviceName was custom */}
                      {secondarySubtitle && (
                        <p className="text-xs font-medium text-slate-500">{secondarySubtitle}</p>
                      )}

                      {/* Metadata Details Row */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                        {/* IP Address */}
                        {session.ipAddress && (
                          <span className="inline-flex items-center gap-1 font-mono text-slate-600">
                            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {session.ipAddress}
                          </span>
                        )}

                        {/* Activity Status */}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {session.logoutAt
                            ? `Logged out ${safeFormatDistance(session.logoutAt)}`
                            : session.lastUsedAt
                              ? `Last active ${safeFormatDistance(session.lastUsedAt)}`
                              : `Started ${safeFormatDistance(session.createdAt)}`}
                        </span>

                        {/* Created date */}
                        {session.createdAt && (
                          <span className="inline-flex items-center gap-1 text-slate-400 hidden md:inline-flex">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Signed in {safeFormatDate(session.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* User Agent preview */}
                      {session.userAgent && (
                        <p
                          className="text-[11px] text-slate-400 font-mono truncate max-w-xl pt-0.5"
                          title={session.userAgent}
                        >
                          {session.userAgent}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center sm:self-center shrink-0 pt-2 sm:pt-0">
                    {isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors text-xs font-medium h-9 px-3.5 rounded-xl cursor-pointer"
                        onClick={() => handleRevoke(session.sessionId)}
                        disabled={revokeSession.isPending}
                        title="Sign out this session"
                      >
                        {isRevokingThisSession ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Signing out…
                          </span>
                        ) : (
                          'Sign out'
                        )}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium px-3 py-1.5 bg-slate-100/70 rounded-xl border border-slate-200">
                        Revoked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start space-x-3 text-orange-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
        <p className="text-sm leading-relaxed">
          If you see a device or location you don&apos;t recognize, sign out of that session
          immediately and change your password in the Security settings.
        </p>
      </div>
    </div>
  );
};

function SessionsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center space-x-4 flex-1">
              <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className={`h-4 ${i === 0 ? 'w-44' : 'w-36'} rounded-md`} />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-24 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
                <Skeleton className="h-2.5 w-72 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
