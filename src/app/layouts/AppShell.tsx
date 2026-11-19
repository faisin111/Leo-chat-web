import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';
import { wsService } from '@/shared/api/websocket';
import { CallManager } from '@/features/calls';

export default function AppShell() {
  const location = useLocation();
  const isConversationDetail = location.pathname.startsWith('/app/c/');

  useEffect(() => {
    wsService.connect();
    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      <NavigationRail />
      <main
        className={`flex-1 flex relative overflow-hidden bg-background min-w-0 h-full order-first md:order-last ${
          !isConversationDetail ? 'pb-16 md:pb-0' : ''
        }`}
      >
        <AnimatedOutlet />
      </main>
      <CallManager />
    </div>
  );
}
