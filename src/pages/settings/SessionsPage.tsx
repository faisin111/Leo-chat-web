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
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Sessions & Devices
            </h1>
            {!isLoading && sessions && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {activeCount} active
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            Manage browser sessions and devices currently signed into your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && <SessionsSkeleton />}

        {isError && (
          <div className="p-6 bg-destructive/10 text-destructive rounded-2xl border border-destructive/20 text-center text-sm font-medium">
            Failed to load sessions. Please try refreshing the page.
          </div>
        )}

        {!isLoading && !isError && sessions?.length === 0 && (
          <div className="p-10 bg-card text-muted-foreground rounded-2xl border border-border text-center">
            <ShieldCheck className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold text-foreground text-base mb-1">No active sessions</h3>
            <p className="text-sm text-muted-foreground">
              There are no devices or sessions on record.
            </p>
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
                className={`p-5 sm:p-6 bg-card rounded-2xl border transition-all shadow-xs relative overflow-hidden ${
                  isActive
                    ? 'border-border hover:border-primary/40'
                    : 'border-border/60 bg-muted/30 opacity-75'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Device Icon & Information */}
                  <div className="flex items-start sm:items-center space-x-4 min-w-0 flex-1">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-muted text-muted-foreground border border-border'
                      }`}
                    >
                      <DeviceIcon className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      {/* Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                          {primaryTitle}
                        </h3>

                        {/* Active / Inactive Badge */}
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                            Signed out
                          </span>
                        )}

                        {/* Platform Badge */}
                        {session.platform && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                            {session.platform.toUpperCase()}
                          </span>
                        )}

                        {/* App Version Badge */}
                        {session.appVersion && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            {`v${session.appVersion}`}
                          </span>
                        )}
                      </div>

                      {/* Subtitle if deviceName was custom */}
                      {secondarySubtitle && (
                        <p className="text-xs font-medium text-muted-foreground">
                          {secondarySubtitle}
                        </p>
                      )}

                      {/* Metadata Details Row */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-muted-foreground pt-1">
                        {/* IP Address */}
                        {session.ipAddress && (
                          <span className="inline-flex items-center gap-1 font-mono text-foreground">
                            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {session.ipAddress}
                          </span>
                        )}

                        {/* Activity Status */}
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          {session.logoutAt
                            ? `Logged out ${safeFormatDistance(session.logoutAt)}`
                            : session.lastUsedAt
                              ? `Last active ${safeFormatDistance(session.lastUsedAt)}`
                              : `Started ${safeFormatDistance(session.createdAt)}`}
                        </span>

                        {/* Created date */}
                        {session.createdAt && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground hidden md:inline-flex">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            Signed in {safeFormatDate(session.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* User Agent preview */}
                      {session.userAgent && (
                        <p
                          className="text-[11px] text-muted-foreground font-mono truncate max-w-xl pt-0.5"
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
                        className="text-muted-foreground hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-colors text-xs font-medium h-9 px-3.5 rounded-xl cursor-pointer"
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
                      <span className="text-xs text-muted-foreground font-medium px-3 py-1.5 bg-muted rounded-xl border border-border">
                        Revoked
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-3 text-amber-800 dark:text-amber-300">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
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
          className="p-5 sm:p-6 bg-card rounded-2xl border border-border shadow-xs relative overflow-hidden"
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
