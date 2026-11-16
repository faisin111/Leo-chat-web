import { useQuery } from '@tanstack/react-query';
import { mediaApi } from './media-api';

export function useMediaDownloadUrl(storageKey?: string | null, fallbackUrl?: string | null) {
  const query = useQuery({
    queryKey: ['media-download', storageKey],
    queryFn: () => (storageKey ? mediaApi.getDownloadUrl(storageKey) : null),
    enabled: Boolean(storageKey),
    staleTime: 10 * 60 * 1000, // 10 minutes cache (presigned URL is valid for 15 mins)
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });

  return {
    url: query.data?.url || fallbackUrl || null,
    isLoading: query.isLoading && !fallbackUrl,
    isError: query.isError,
  };
}
