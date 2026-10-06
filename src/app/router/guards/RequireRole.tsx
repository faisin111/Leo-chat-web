import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function RequireRole({ requiredRole }: { requiredRole: 'ADMIN' | 'USER' }) {
  const userRole = useSession((s) => s.user?.role);
  return userRole === requiredRole ? <Outlet /> : <Navigate to="/403" replace />;
}
