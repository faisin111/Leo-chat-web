import { useState } from 'react';
import { useSession } from '@/features/auth';
import { useStartDirectMessage } from '@/features/chat';
import { usersApi } from '@/features/users';
import { Button } from '@/shared/ui/button';
import { Avatar } from '@/shared/ui/avatar';
import { QrCodeRenderer } from './components/QrCodeRenderer';
import { QrScanner } from './components/QrScanner';
import {
  QrCode,
  Globe,
  Camera,
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type QrTab = 'my-code' | 'web-access' | 'scan';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function QrCodePage() {
  const [activeTab, setActiveTab] = useState<QrTab>('my-code');
  const user = useSession((s) => s.user);
  const navigate = useNavigate();
  const startDm = useStartDirectMessage();

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const profileConnectUrl = user?.id
    ? `${baseUrl}/app/connect?user=${encodeURIComponent(user.id)}`
    : user?.username
      ? `${baseUrl}/app/connect?user=${encodeURIComponent(user.username)}`
      : `${baseUrl}/app`;
  const webAppUrl = `${baseUrl}/app`;

  const getInitials = (name?: string | null) => (name || 'User').substring(0, 2).toUpperCase();

  const handleDecodedScan = async (decodedText: string) => {
    try {
      const trimmed = decodedText.trim();

      // 1. Check if the scanned string is a LeoChat URL containing ?user=<userId> or ?u= or ?id=
      if (
        trimmed.includes('connect?user=') ||
        trimmed.includes('?user=') ||
        trimmed.includes('?u=') ||
        trimmed.includes('?id=') ||
        trimmed.includes('?userId=')
      ) {
        const url = new URL(trimmed, baseUrl);
        const targetUserId =
          url.searchParams.get('user') ||
          url.searchParams.get('u') ||
          url.searchParams.get('id') ||
          url.searchParams.get('userId');

        if (targetUserId) {
          if (
            targetUserId === user?.id ||
            (user?.username && targetUserId.toLowerCase() === user.username.toLowerCase())
          ) {
            toast.info('This is your own profile QR code!');
            return;
          }
          toast.success('User QR code recognized! Opening conversation...');

          if (UUID_REGEX.test(targetUserId)) {
            startDm.mutate(targetUserId);
          } else {
            // Resolve username
            try {
              const results = await usersApi.searchUsers(targetUserId, 0, 5);
              const found = results.find(
                (u) =>
                  (u.username || '').toLowerCase() === targetUserId.toLowerCase() ||
                  (u.displayName || '').toLowerCase() === targetUserId.toLowerCase(),
              );
              const resolvedId = found?.id;
              if (resolvedId) {
                startDm.mutate(resolvedId);
              } else {
                toast.error(`User @${targetUserId} not found.`);
              }
            } catch {
              toast.error(`Could not find user @${targetUserId}.`);
            }
          }
          return;
        }
      }

      // 2. Direct UUID check
      if (UUID_REGEX.test(trimmed)) {
        if (trimmed === user?.id) {
          toast.info('This is your own profile QR code!');
          return;
        }
        toast.success('User ID recognized! Starting chat...');
        startDm.mutate(trimmed);
        return;
      }

      // 3. If it's a LeoChat app URL, navigate internally
      if (trimmed.startsWith(baseUrl)) {
        const path = trimmed.replace(baseUrl, '');
        navigate(path || '/app');
        return;
      }

      // 4. External link
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        toast.info(`Scanned external link: ${trimmed}`);
        window.open(trimmed, '_blank', 'noopener,noreferrer');
        return;
      }

      toast.info(`Scanned content: ${trimmed}`);
    } catch {
      toast.error('Could not process the scanned QR code');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      {/* Top Header */}
      <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/app" title="Back to chats">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              <span>Web QR Code & Connect</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Scan to chat, open LeoChat Web in Chrome, or scan another user
            </p>
          </div>
        </div>

        {/* Quick Link to Web URL */}
        <a
          href={webAppUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Open Web</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col items-center">
        {/* Navigation Tabs */}
        <div className="w-full max-w-md grid grid-cols-3 p-1 bg-muted rounded-2xl border border-border mb-8 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('my-code')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'my-code'
                ? 'bg-card text-foreground shadow-sm shadow-primary/10 border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>My Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('web-access')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'web-access'
                ? 'bg-card text-foreground shadow-sm shadow-primary/10 border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Open in Chrome</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'scan'
                ? 'bg-card text-foreground shadow-sm shadow-primary/10 border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan Code</span>
          </button>
        </div>

        {/* Tab 1: My Profile QR Code */}
        {activeTab === 'my-code' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <QrCodeRenderer
              value={profileConnectUrl}
              userName={user?.displayName || 'LeoChat User'}
              userHandle={user?.username || undefined}
              subtitle="Scan with any smartphone camera or Chrome to instantly open LeoChat and chat with me."
              downloadFilename={`leochat-${user?.username || 'user'}-qr`}
              userAvatar={
                <Avatar
                  src={user?.profilePictureUrl || undefined}
                  fallback={getInitials(user?.displayName)}
                  className="w-16 h-16 rounded-full border-2 border-primary/30 shadow-md text-base font-bold bg-primary/10 text-primary"
                />
              }
            />

            {/* Localhost developer hint */}
            {isLocalhost && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-sm w-full text-center flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-300 text-left leading-relaxed">
                  <strong>Scanning from a separate phone?</strong> A phone cannot resolve{' '}
                  <code>localhost</code>. To test scanning with your mobile device, open LeoChat on
                  your local Wi-Fi IP (e.g. <code>http://192.168.x.x:5173</code>) or on the deployed
                  Vercel domain.
                </p>
              </div>
            )}

            {/* Feature Callout */}
            <div className="mt-8 p-4 rounded-2xl bg-card border border-border/70 max-w-sm w-full text-center space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Automatic User Routing
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When another user scans this code, their browser will automatically launch LeoChat
                Web and open a direct message conversation with you.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Open Web in Chrome QR Code */}
        {activeTab === 'web-access' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <QrCodeRenderer
              value={webAppUrl}
              userName="LeoChat Web"
              subtitle="Scan with Google Chrome or your phone camera to easily open LeoChat Web without typing."
              downloadFilename="leochat-web-access-qr"
              userAvatar={
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 font-bold">
                  <Globe className="w-7 h-7" />
                </div>
              }
            />

            {/* Localhost developer hint */}
            {isLocalhost && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-sm w-full text-center flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 dark:text-amber-300 text-left leading-relaxed">
                  <strong>Scanning from a separate phone?</strong> A phone cannot resolve{' '}
                  <code>localhost</code>. To test scanning with your mobile device, open LeoChat on
                  your local Wi-Fi IP or on the deployed Vercel domain.
                </p>
              </div>
            )}

            {/* Steps Guide */}
            <div className="mt-8 p-5 rounded-2xl bg-card border border-border max-w-md w-full space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                Easy Web Access on Mobile or Chrome:
              </h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
                <li>
                  Open the <strong className="text-foreground">Camera app</strong> or{' '}
                  <strong className="text-foreground">Google Chrome</strong> on your phone or
                  device.
                </li>
                <li>Point the camera lens at the QR code above.</li>
                <li>
                  Tap the notification banner that appears to instantly open{' '}
                  <strong className="text-foreground">LeoChat Web</strong> in Chrome.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 3: Live Scanner */}
        {activeTab === 'scan' && (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <QrScanner onScan={handleDecodedScan} isProcessing={startDm.isPending} />
          </div>
        )}
      </div>
    </div>
  );
}

export default QrCodePage;
