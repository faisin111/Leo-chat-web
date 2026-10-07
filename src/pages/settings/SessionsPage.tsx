import { Button } from '@/shared/ui/button';
import { Laptop, Smartphone, AlertTriangle, Monitor, Loader2 } from 'lucide-react';
// eslint-disable-next-line no-restricted-imports
import { useSessions } from '@/features/users/api/use-sessions';
// eslint-disable-next-line no-restricted-imports
import { useRevokeSession } from '@/features/users/api/use-revoke-session';
import { formatDistanceToNow } from 'date-fns';

function parseUserAgent(ua: string) {
  if (!ua) return { os: 'Unknown OS', browser: 'Unknown Browser', isMobile: false };
  let os = 'Unknown OS';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  let browser = 'Unknown Browser';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  const isMobile = os === 'Android' || os === 'iOS';

  return { os, browser, isMobile };
}

export const SessionsPage = () => {
  const { data: sessions, isLoading, isError } = useSessions();
  const revokeSession = useRevokeSession();

  const handleRevoke = (sessionId: string) => {
    revokeSession.mutate(sessionId);
  };

  return (
    <div className="max-w-3xl w-full mx-auto p-8 overflow-y-auto">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Sessions & Devices
          </h1>
          <p className="text-slate-500">
            Manage the devices that are currently logged into your account.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {isError && (
          <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
            Failed to load sessions. Please try again.
          </div>
        )}

        {!isLoading && !isError && sessions?.length === 0 && (
          <div className="p-6 bg-white text-slate-500 rounded-2xl border border-slate-200 text-center">
            No active sessions found.
          </div>
        )}

        {!isLoading &&
          !isError &&
          sessions?.map((session) => {
            const { os, browser, isMobile } = parseUserAgent(session.deviceInfo);
            const DeviceIcon = isMobile
              ? Smartphone
              : os === 'macOS' || os === 'Windows'
                ? Laptop
                : Monitor;

            let lastActiveStr = 'Unknown';
            if (session.lastUsedAt) {
              lastActiveStr = `Last active ${formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true })}`;
            } else if (session.createdAt) {
              lastActiveStr = `Started ${formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}`;
            }

            return (
              <div
                key={session.sessionId}
                className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-500">
                      <DeviceIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center">
                        {os} · {browser}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{lastActiveStr}</p>
                      <p className="text-xs text-slate-400 mt-1 truncate max-w-sm">
                        {session.deviceInfo || 'Unknown device details'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                    onClick={() => handleRevoke(session.sessionId)}
                    disabled={revokeSession.isPending}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start space-x-3 text-orange-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-600" />
        <p className="text-sm">
          If you see a device you don&apos;t recognize, sign out immediately and change your
          password to secure your account.
        </p>
      </div>
    </div>
  );
};
