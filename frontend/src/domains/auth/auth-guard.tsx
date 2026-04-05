import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state: RootState) => {
    const authState = (state as Record<string, unknown>).auth as {
      isAuthenticated: boolean;
      user: { role: string } | null;
    };
    return authState;
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
}
