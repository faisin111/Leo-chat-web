import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSession, authSession } from '@/features/auth';

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const status = useSession((s) => s.status);

  useEffect(() => {
    if (status !== 'unknown') return;

    // Fast path: no previous session flag → immediately mark anonymous.
    // This avoids a slow network round-trip on every fresh page visit.
    if (!authSession.mightBeActive()) {
      useSession.getState().clear();
      return;
    }

    // Slow path: a flag says we might have a live refresh-token cookie,
    // so try to silently restore the session.
    let mounted = true;
    async function tryRestore() {
      try {
        await authSession.refresh();
        // On success setAccessToken is called inside authSession.refresh()
        // The status remains 'unknown' until we also call setSession with a user.
        // For now, mark anonymous if we can't get the full user profile yet.
        // TODO: follow up with GET /users/me and call setSession(token, user)
        if (mounted) useSession.getState().clear();
      } catch {
        if (mounted) {
          authSession.expire(); // clear flag so next load is instant
          useSession.getState().clear();
        }
      }
    }

    tryRestore();
    return () => {
      mounted = false;
    };
  }, [status]);

  return <>{children}</>;
}
