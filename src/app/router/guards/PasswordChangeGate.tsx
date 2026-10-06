import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/features/auth';

export function PasswordChangeGate() {
  const mustChangePassword = useSession((s) => s.user?.mustChangePassword);
  return mustChangePassword ? <Navigate to="/change-password-required" replace /> : <Outlet />;
}
