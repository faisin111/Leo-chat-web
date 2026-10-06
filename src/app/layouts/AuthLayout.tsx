import { AnimatedOutlet } from './AnimatedOutlet';

export default function AuthLayout() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <AnimatedOutlet />
    </div>
  );
}
