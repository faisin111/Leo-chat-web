import { AnimatedOutlet } from './AnimatedOutlet';

export default function AppRoot() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground">
      <AnimatedOutlet />
    </div>
  );
}
