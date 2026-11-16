import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { SessionBootstrap } from './SessionBootstrap';
import { showApiError } from '@/shared/api/api-error';
import { ThemeSync } from '@/shared/theme';
import { ModernToaster } from '@/shared/ui/toaster';

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Surface unhandled mutation errors globally with clear backend details
      if (!mutation.options.onError) {
        showApiError(error);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (count, err: unknown) => {
        const error = err as { status?: number };
        if (error.status && [400, 401, 403, 404, 409, 422].includes(error.status)) {
          return false;
        }
        return count < 2;
      },
    },
    mutations: { retry: false },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ThemeSync />
      <QueryClientProvider client={queryClient}>
        <SessionBootstrap>{children}</SessionBootstrap>
        <ModernToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
