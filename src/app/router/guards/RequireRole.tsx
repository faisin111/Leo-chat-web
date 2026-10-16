import { Navigate, Outlet } from 'react-router-dom';
import { useSession, isAdminRole } from '@/features/auth';

export function RequireRole({ requiredRole }: { requiredRole: 'ADMIN' | 'USER' }) {
  const userRole = useSession((s) => s.user?.role);
  const hasAccess = requiredRole === 'ADMIN' ? isAdminRole(userRole) : Boolean(userRole);

  return hasAccess ? <Outlet /> : <Navigate to="/403" replace />;
}
