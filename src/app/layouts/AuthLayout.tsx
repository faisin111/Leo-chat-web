import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Leo Chat</h1>
        <Outlet />
      </div>
    </div>
  );
}
