import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function RequireGuest() {
  const status = useSession((s) => s.status);
  const location = useLocation();

  if (status === 'unknown') return <div className="p-8 text-center">Loading session...</div>;
  if (status === 'authenticated') {
    const from = location.state?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
