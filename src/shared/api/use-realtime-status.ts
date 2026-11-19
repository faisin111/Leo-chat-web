import { useEffect, useState } from 'react';
import { wsService } from './websocket';

/** Whether this browser's realtime (STOMP) connection is currently up. Polled every few seconds. */
export function useRealtimeStatus(intervalMs = 3000): boolean {
  const [connected, setConnected] = useState(wsService.isConnected);
  useEffect(() => {
    const id = setInterval(() => setConnected(wsService.isConnected), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return connected;
}
