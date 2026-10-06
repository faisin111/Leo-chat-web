import { AnimatedOutlet } from './AnimatedOutlet';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AnimatedOutlet />
    </div>
  );
}
