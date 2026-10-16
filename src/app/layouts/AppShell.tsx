import { useEffect } from 'react';
import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';
import { wsService } from '@/shared/api/websocket';

export default function AppShell() {
  useEffect(() => {
    wsService.connect();
    return () => {
      wsService.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-background text-foreground overflow-hidden">
      <NavigationRail />
      <main className="flex-1 flex relative overflow-hidden bg-white min-w-0 h-full order-first md:order-last">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
