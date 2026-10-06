import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionBootstrap } from './SessionBootstrap';

const queryClient = new QueryClient({
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
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
      <Toaster
        position="top-right"
        className="toaster group"
        toastOptions={{
          classNames: {
            toast: 'group toast group-[.toaster]:shadow-lg group-[.toaster]:font-sans',
            error:
              'group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border-red-600',
            success:
              'group-[.toaster]:bg-green-500 group-[.toaster]:text-white group-[.toaster]:border-green-600',
            warning:
              'group-[.toaster]:bg-amber-500 group-[.toaster]:text-white group-[.toaster]:border-amber-600',
            info: 'group-[.toaster]:bg-blue-500 group-[.toaster]:text-white group-[.toaster]:border-blue-600',
          },
        }}
      />
    </QueryClientProvider>
  );
}
