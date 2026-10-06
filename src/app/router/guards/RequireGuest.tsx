import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function RequireGuest() {
  const status = useSession((s) => s.status);
  const location = useLocation();

  // 'unknown' is now resolved instantly in SessionBootstrap – render nothing
  // for the single frame it takes to avoid any flicker.
  if (status === 'unknown') return null;
  if (status === 'authenticated') {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app';
    return <Navigate to={from} replace />;
  }

  return <Outlet />;
}
