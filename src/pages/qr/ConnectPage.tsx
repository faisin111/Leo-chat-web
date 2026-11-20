import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/features/auth';
import { useStartDirectMessage } from '@/features/chat';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';

export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const status = useSession((s) => s.status);
  const startDm = useStartDirectMessage();
  const hasTriggeredRef = useRef(false);

  const targetUserId = searchParams.get('user');

  useEffect(() => {
    // Wait until auth session status is confirmed
    if (status === 'unknown') return;

    if (status !== 'authenticated' || !user) {
      // Save intended destination for post-login redirection
      const destination = `/app/connect?user=${encodeURIComponent(targetUserId || '')}`;
      sessionStorage.setItem('leochat_post_auth_redirect', destination);
      navigate(`/login?redirect=${encodeURIComponent(destination)}`, { replace: true });
      return;
    }

    if (!targetUserId) {
      toast.error('Invalid connect QR link: no user specified.');
      navigate('/app', { replace: true });
      return;
    }

    if (targetUserId === user.id) {
      toast.info('You scanned your own profile QR code!');
      navigate('/app', { replace: true });
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Start or navigate to the direct conversation with the target user
    startDm.mutate(targetUserId, {
      onError: () => {
        toast.error('Could not find user or start conversation.');
        navigate('/app', { replace: true });
      },
    });
  }, [status, user, targetUserId, startDm, navigate]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <div className="w-full max-w-sm p-8 bg-card border border-border rounded-3xl shadow-2xl flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
          <MessageSquare className="w-8 h-8" />
        </div>

        {startDm.isError ? (
          <>
            <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to Connect</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Unable to find this user or open the direct chat.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/app')}
              className="rounded-xl text-xs mt-2"
            >
              Back to Chats
            </Button>
          </>
        ) : (
          <>
            <h2 className="font-bold text-base text-foreground">Connecting on LeoChat Web</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              QR code recognized. Opening direct chat with this user...
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-medium pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading conversation...</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConnectPage;
