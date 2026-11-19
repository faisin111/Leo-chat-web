import { useEffect, useRef } from 'react';
import { wsService } from '@/shared/api/websocket';
import { useCallStore } from '../store/call.store';
import { IncomingCallDialog } from './IncomingCallDialog';
import { ActiveCallModal } from './ActiveCallModal';

export const CallManager = () => {
  const handleIncomingSignal = useCallStore((s) => s.handleIncomingSignal);
  const remoteStream = useCallStore((s) => s.remoteStream);
  const status = useCallStore((s) => s.status);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Register listener for real-time WebRTC signals routed through /user/queue/calls
    const unsubscribe = wsService.addCallSignalListener((event) => {
      handleIncomingSignal(event);
    });

    return () => {
      unsubscribe();
    };
  }, [handleIncomingSignal]);

  // Dedicated remote audio output mounted at the top-level application shell.
  // Persists audio continuously across modal open, audio-only, minimized PIP, and tab navigation.
  useEffect(() => {
    const el = remoteAudioRef.current;
    if (!el) return;

    if (remoteStream && (status === 'connected' || status === 'connecting')) {
      if (el.srcObject !== remoteStream) {
        el.srcObject = remoteStream;
      }
      el.play().catch((err) => {
        // Autoplay may be blocked by browser policy until user interacts with the page
        console.warn('[CallManager] Remote audio autoplay attempt:', err);
      });
    } else {
      el.srcObject = null;
    }
  }, [remoteStream, status]);

  return (
    <>
      {/* Top-level persistent remote audio element for bidirectional WebRTC voice */}
      <audio ref={remoteAudioRef} autoPlay>
        <track kind="captions" />
      </audio>
      <IncomingCallDialog />
      <ActiveCallModal />
    </>
  );
};
