import { AnimatedOutlet } from './AnimatedOutlet';
import { NavigationRail } from './components/NavigationRail';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <NavigationRail />
      <main className="flex-1 flex relative overflow-hidden bg-white">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
