import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@store/index';
import { clearCredentials } from './auth-slice';
import { useLogoutMutation } from './auth-api';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => {
    return (state as Record<string, unknown>).auth as {
      isAuthenticated: boolean;
      user: { id: string; firstName: string; lastName: string; role: string } | null;
      accessToken: string | null;
    };
  });

  const [logoutMutation] = useLogoutMutation();

  const logout = async () => {
    try {
      await logoutMutation().unwrap();
    } finally {
      dispatch(clearCredentials());
    }
  };

  return {
    ...authState,
    logout,
  };
}
