import authReducer, { setCredentials, clearCredentials, updateAccessToken } from './auth-slice';

const mockUser = { id: 'user-1', firstName: 'Jane', lastName: 'Doe', role: 'teacher' };

describe('authSlice', () => {
  it('should return initial state', () => {
    const state = authReducer(undefined, { type: '@@init' });
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  describe('setCredentials', () => {
    it('should set user, accessToken, and mark as authenticated', () => {
      const state = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'token-abc' }),
      );
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('token-abc');
    });

    it('should store csrfToken when provided', () => {
      const state = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'token', csrfToken: 'csrf-xyz' }),
      );
      expect(state.csrfToken).toBe('csrf-xyz');
    });
  });

  describe('clearCredentials', () => {
    it('should reset all auth state', () => {
      const loggedIn = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'token' }),
      );
      const cleared = authReducer(loggedIn, clearCredentials());

      expect(cleared.isAuthenticated).toBe(false);
      expect(cleared.user).toBeNull();
      expect(cleared.accessToken).toBeNull();
      expect(cleared.csrfToken).toBeNull();
    });
  });

  describe('updateAccessToken', () => {
    it('should update only the access token', () => {
      const loggedIn = authReducer(
        undefined,
        setCredentials({ user: mockUser, accessToken: 'old-token' }),
      );
      const updated = authReducer(loggedIn, updateAccessToken('new-token'));

      expect(updated.accessToken).toBe('new-token');
      expect(updated.user).toEqual(mockUser);
      expect(updated.isAuthenticated).toBe(true);
    });
  });
});
