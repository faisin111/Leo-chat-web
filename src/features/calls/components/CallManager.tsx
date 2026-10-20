import { useEffect } from 'react';
import { wsService } from '@/shared/api/websocket';
import { useCallStore } from '../store/call.store';
import { IncomingCallDialog } from './IncomingCallDialog';
import { ActiveCallModal } from './ActiveCallModal';

export const CallManager = () => {
  const handleIncomingSignal = useCallStore((s) => s.handleIncomingSignal);

  useEffect(() => {
    // Register listener for real-time WebRTC signals routed through /user/queue/calls
    const unsubscribe = wsService.addCallSignalListener((event) => {
      handleIncomingSignal(event);
    });

    return () => {
      unsubscribe();
    };
  }, [handleIncomingSignal]);

  return (
    <>
      <IncomingCallDialog />
      <ActiveCallModal />
    </>
  );
};
