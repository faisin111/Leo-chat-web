import { useState } from 'react';
import { useSession } from '@/features/auth';
import { useStartDirectMessage } from '@/features/chat';
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
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type QrTab = 'my-code' | 'web-access' | 'scan';

export function QrCodePage() {
  const [activeTab, setActiveTab] = useState<QrTab>('my-code');
  const user = useSession((s) => s.user);
  const navigate = useNavigate();
  const startDm = useStartDirectMessage();

  const baseUrl = window.location.origin;
  const profileConnectUrl = user?.id ? `${baseUrl}/app/connect?user=${user.id}` : `${baseUrl}/app`;
  const webAppUrl = `${baseUrl}/app`;

  const getInitials = (name?: string | null) => (name || 'User').substring(0, 2).toUpperCase();

  const handleDecodedScan = (decodedText: string) => {
    try {
      // 1. Check if the scanned string is a LeoChat URL containing ?user=<userId>
      if (decodedText.includes('connect?user=') || decodedText.includes('?user=')) {
        const url = new URL(decodedText, baseUrl);
        const targetUserId = url.searchParams.get('user');
        if (targetUserId) {
          if (targetUserId === user?.id) {
            toast.info('This is your own profile QR code!');
            return;
          }
          toast.success('User QR code recognized! Opening conversation...');
          startDm.mutate(targetUserId);
          return;
        }
      }

      // 2. Check if the scanned string is a relative route like /app/c/123 or /app/connect?user=123
      if (decodedText.startsWith('/app/connect?user=')) {
        const url = new URL(decodedText, baseUrl);
        const targetUserId = url.searchParams.get('user');
        if (targetUserId) {
          if (targetUserId === user?.id) {
            toast.info('This is your own profile QR code!');
            return;
          }
          toast.success('User QR code recognized! Opening conversation...');
          startDm.mutate(targetUserId);
          return;
        }
      }

      // 3. Check if it's a UUID (direct user ID)
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          decodedText,
        );
      if (isUuid) {
        if (decodedText === user?.id) {
          toast.info('This is your own profile QR code!');
          return;
        }
        toast.success('User ID recognized! Starting chat...');
        startDm.mutate(decodedText);
        return;
      }

      // 4. If it's a LeoChat app URL, navigate internally
      if (decodedText.startsWith(baseUrl)) {
        const path = decodedText.replace(baseUrl, '');
        navigate(path || '/app');
        return;
      }

      // 5. If it's any other web link
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        toast.info(`Scanned external link: ${decodedText}`);
        window.open(decodedText, '_blank', 'noopener,noreferrer');
        return;
      }

      toast.info(`Scanned content: ${decodedText}`);
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
