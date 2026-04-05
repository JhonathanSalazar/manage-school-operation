jest.mock('@config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test_access_secret_that_is_long_enough_32ch',
    JWT_REFRESH_SECRET: 'test_refresh_secret_that_is_long_enough_32c',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '@shared/jwt';

describe('JWT utilities', () => {
  const payload = { sub: 'user-id-123', role: 'admin', permissions: ['users:read'] };

  describe('access token', () => {
    it('should sign and verify a round trip', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.permissions).toEqual(payload.permissions);
    });

    it('should throw on a tampered token', () => {
      const token = signAccessToken(payload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow();
    });
  });

  describe('refresh token', () => {
    it('should sign and verify a round trip', () => {
      const token = signRefreshToken({ sub: 'user-id-123' });
      const decoded = verifyRefreshToken(token);
      expect(decoded.sub).toBe('user-id-123');
    });

    it('should not verify an access token as a refresh token', () => {
      const accessToken = signAccessToken(payload);
      expect(() => verifyRefreshToken(accessToken)).toThrow();
    });
  });
});
