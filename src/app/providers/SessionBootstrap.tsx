import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSession, authSession } from '@/features/auth';

export function SessionBootstrap({ children }: { children: ReactNode }) {
  const status = useSession((s) => s.status);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        // Attempt to refresh the session token
        await authSession.refresh();

        // TODO: In a complete implementation, we should also fetch the user profile here
        // e.g. const user = await http.get('/users/me').then(r => r.data);
        // and then call setSession(token, user).

        // For now, since we only have the shell, we'll mark as anonymous if refresh fails
        // or we don't have a real backend connected yet.
      } catch {
        if (mounted) {
          useSession.getState().clear(); // Sets status to 'anonymous'
        }
      }
    }

    if (status === 'unknown') {
      bootstrap();
    }

    return () => {
      mounted = false;
    };
  }, [status]);

  return <>{children}</>;
}
