import { Button } from '@/shared/ui/button';
import { Laptop, Smartphone, AlertTriangle, Monitor, Loader2 } from 'lucide-react';
// eslint-disable-next-line no-restricted-imports
import { useSessions } from '@/features/users/api/use-sessions';
import { formatDistanceToNow } from 'date-fns';

export const SessionsPage = () => {
  const { data: sessions, isLoading, isError } = useSessions();

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
        <Button
          variant="destructive"
          className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none"
        >
          Sign out all other devices
        </Button>
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
            // Attempt to parse some info if the API doesn't provide exact fields
            const isMobile =
              session.deviceType?.toLowerCase() === 'mobile' ||
              session.userAgent?.toLowerCase().includes('mobile');
            const DeviceIcon = isMobile
              ? Smartphone
              : session.deviceType === 'desktop'
                ? Monitor
                : Laptop;
            const browserStr = session.browser || session.userAgent || 'Unknown Browser';
            const osStr = session.os || (isMobile ? 'Mobile OS' : 'Desktop OS');
            const isCurrent = session.isCurrentSession;

            let lastActiveStr = 'Unknown';
            if (isCurrent) {
              lastActiveStr = 'Active now';
            } else if (session.lastActiveAt) {
              lastActiveStr = `Last active ${formatDistanceToNow(new Date(session.lastActiveAt), { addSuffix: true })}`;
            }

            return (
              <div
                key={session.id}
                className={`p-6 bg-white rounded-2xl border shadow-sm relative overflow-hidden ${isCurrent ? 'border-primary/20' : 'border-slate-200'}`}
              >
                {isCurrent && <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${isCurrent ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}
                    >
                      <DeviceIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center">
                        {osStr} • {browserStr}
                        {isCurrent && (
                          <span className="ml-3 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                            Current
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {session.location || 'Unknown location'} • {lastActiveStr}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        IP: {session.ipAddress || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button variant="outline" className="text-slate-600">
                      Sign out
                    </Button>
                  )}
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
