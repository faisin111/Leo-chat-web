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
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-background text-foreground overflow-hidden">
      <NavigationRail />
      <main className="flex-1 flex relative overflow-hidden bg-white mb-16 md:mb-0">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
