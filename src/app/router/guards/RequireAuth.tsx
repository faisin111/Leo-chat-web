import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function RequireAuth() {
  const status = useSession((s) => s.status);
  const location = useLocation();

  // 'unknown' resolves instantly now – render null to avoid any flash
  if (status === 'unknown') return null;
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
}
