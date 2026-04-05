import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import { ROUTES } from './route-constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredPermission,
  adminOnly,
}: ProtectedRouteProps) {
  const location = useLocation();
  const authState = useSelector((state: RootState) => {
    return (state as Record<string, unknown>).auth as {
      isAuthenticated: boolean;
      user: { role: string; permissions?: string[] } | null;
    };
  });

  if (!authState.isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (adminOnly && authState.user?.role !== 'admin') {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  if (requiredPermission && !authState.user?.permissions?.includes(requiredPermission)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <>{children}</>;
}
