import { AnimatedOutlet } from './AnimatedOutlet';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border hidden md:flex flex-col">
        {/* Sidebar content */}
        <div className="p-4 border-b border-border font-bold">Leo Chat</div>
        <nav className="flex-1 overflow-y-auto p-4">
          <p>Sidebar Navigation</p>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
