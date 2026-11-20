import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/features/auth';
import { useStartDirectMessage } from '@/features/chat';
import { usersApi } from '@/features/users';
import {
  Loader2,
  MessageSquare,
  AlertCircle,
  UserCheck,
  RefreshCw,
  Users,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const status = useSession((s) => s.status);
  const startDm = useStartDirectMessage();
  const hasTriggeredRef = useRef(false);

  const [isResolving, setIsResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const targetParam =
    searchParams.get('user') ||
    searchParams.get('u') ||
    searchParams.get('id') ||
    searchParams.get('userId');

  const isOwnProfile = Boolean(
    user &&
    targetParam &&
    (targetParam === user.id ||
      (user.username && targetParam.toLowerCase() === user.username.toLowerCase())),
  );

  const connectToUser = useCallback(
    async (rawTarget: string) => {
      setErrorMessage(null);
      const trimmed = rawTarget.trim();
      if (!trimmed) {
        setErrorMessage('No user specified in this QR code or link.');
        return;
      }

      // 1. Direct UUID match
      if (UUID_REGEX.test(trimmed)) {
        startDm.mutate(trimmed, {
          onError: (err: unknown) => {
            const errObj = err as { message?: string };
            setErrorMessage(errObj?.message || 'Unable to open conversation with this user.');
          },
        });
        return;
      }

      // 2. Target is a username (e.g. ?user=alice) -> resolve to UUID first
      try {
        setIsResolving(true);
        const results = await usersApi.searchUsers(trimmed, 0, 10);
        const matched = results.find(
          (u) =>
            (u.username || '').toLowerCase() === trimmed.toLowerCase() ||
            (u.displayName || '').toLowerCase() === trimmed.toLowerCase(),
        );

        const resolvedId = matched?.id;
        if (resolvedId) {
          startDm.mutate(resolvedId, {
            onError: (err: unknown) => {
              const errObj = err as { message?: string };
              setErrorMessage(errObj?.message || 'Unable to open conversation with this user.');
            },
          });
        } else {
          setErrorMessage(`Could not find any user with username or handle "@${trimmed}".`);
        }
      } catch {
        setErrorMessage(`Could not find user "@${trimmed}". Please check the QR code or link.`);
      } finally {
        setIsResolving(false);
      }
    },
    [startDm],
  );

  useEffect(() => {
    // Wait until auth session status is determined
    if (status === 'unknown') return;

    if (status !== 'authenticated' || !user) {
      // Save intended destination for post-login redirection
      const destination = `/app/connect?user=${encodeURIComponent(targetParam || '')}`;
      sessionStorage.setItem('leochat_post_auth_redirect', destination);
      navigate(`/login?redirect=${encodeURIComponent(destination)}`, { replace: true });
      return;
    }

    if (!targetParam) {
      setErrorMessage('No user was specified in this connect link.');
      return;
    }

    if (isOwnProfile) {
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    connectToUser(targetParam);
  }, [status, user, targetParam, isOwnProfile, connectToUser, navigate]);

  const handleRetry = () => {
    if (targetParam) {
      hasTriggeredRef.current = false;
      connectToUser(targetParam);
    }
  };

  const isBusy = isResolving || startDm.isPending;

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 text-center">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-card border border-border rounded-3xl shadow-2xl flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30">
          <MessageSquare className="w-8 h-8" />
        </div>

        {isOwnProfile ? (
          <>
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Your Profile QR Code</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You scanned or opened your own profile connect link. Share this QR code or link with
              other people so they can instantly start a conversation with you!
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/app')}
              className="rounded-xl text-xs mt-2 w-full"
            >
              Back to My Chats
            </Button>
          </>
        ) : errorMessage || startDm.isError ? (
          <>
            <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Unable to Connect</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorMessage || 'Could not find this user or start a direct conversation.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="rounded-xl text-xs flex-1 gap-1.5"
                disabled={isBusy}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/app/people')}
                className="rounded-xl text-xs flex-1 gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Find Users</span>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app')}
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Return to Chats
            </Button>
          </>
        ) : (
          <>
            <h2 className="font-bold text-base text-foreground">Connecting on LeoChat Web</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {targetParam
                ? `QR code recognized. Opening direct chat with ${targetParam.startsWith('@') ? targetParam : '@' + targetParam}...`
                : 'QR code recognized. Opening conversation...'}
            </p>
            <div className="flex items-center gap-2 text-primary text-xs font-medium pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isResolving ? 'Resolving user profile...' : 'Starting chat session...'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ConnectPage;
