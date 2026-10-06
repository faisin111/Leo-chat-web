import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function RequireAuth() {
  const status = useSession((s) => s.status);
  const location = useLocation();

  if (status === 'unknown') return <div className="p-8 text-center">Loading session...</div>;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
