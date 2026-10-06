import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';

export default function AppShell() {
  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-background text-foreground overflow-hidden">
      <NavigationRail />
      <main className="flex-1 flex relative overflow-hidden bg-white min-h-0 min-w-0">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
