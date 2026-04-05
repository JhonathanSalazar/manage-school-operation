jest.mock('@config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test_access_secret_that_is_long_enough_32ch',
    JWT_REFRESH_SECRET: 'test_refresh_secret_that_is_long_enough_32c',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
    FRONTEND_URL: 'http://localhost:5173',
    NODE_ENV: 'test',
    RESEND_API_KEY: '',
  },
}));

jest.mock('@modules/auth/auth.repository');
jest.mock('@shared/password');
jest.mock('@utils/send-email');

import * as repo from '@modules/auth/auth.repository';
import * as passwordUtils from '@shared/password';
import * as authService from '@modules/auth/auth.service';
import { ApiError } from '@utils/api-error';

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;

const fakeUser: repo.UserRow = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  password_hash: '$argon2id$hashed',
  first_name: 'Test',
  last_name: 'User',
  role: 'teacher',
  is_active: true,
  is_verified: true,
};

beforeEach(() => jest.clearAllMocks());

describe('authService.login', () => {
  it('should return tokens and user on valid credentials', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(fakeUser);
    mockPasswordUtils.verifyPassword.mockResolvedValue(true);
    mockRepo.getPermissionsForRole.mockResolvedValue(['students:read', 'notices:read']);
    mockRepo.storeRefreshToken.mockResolvedValue(undefined);

    const result = await authService.login('test@example.com', 'correct_password');

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBe('user-uuid-1');
    expect(result.permissions).toContain('students:read');
  });

  it('should throw 401 when user not found', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);

    await expect(authService.login('unknown@example.com', 'password')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 401 when password is wrong', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(fakeUser);
    mockPasswordUtils.verifyPassword.mockResolvedValue(false);

    await expect(authService.login('test@example.com', 'wrong_password')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('should throw 401 when user is inactive', async () => {
    mockRepo.findUserByEmail.mockResolvedValue({ ...fakeUser, is_active: false });

    await expect(authService.login('test@example.com', 'password')).rejects.toMatchObject({
      statusCode: 401,
    });
  });
});

describe('authService.logout', () => {
  it('should revoke the refresh token', async () => {
    mockRepo.revokeRefreshToken.mockResolvedValue(undefined);

    await authService.logout('user-uuid-1', 'raw-refresh-token');

    expect(mockRepo.revokeRefreshToken).toHaveBeenCalledWith('user-uuid-1', 'raw-refresh-token');
  });
});

describe('authService.resetPassword', () => {
  it('should throw 400 for an invalid reset token', async () => {
    mockRepo.findValidPasswordResetToken.mockResolvedValue(null);

    await expect(authService.resetPassword('bad-token', 'newpass123')).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should update password and revoke all refresh tokens on success', async () => {
    mockRepo.findValidPasswordResetToken.mockResolvedValue({ userId: 'user-uuid-1' });
    mockPasswordUtils.hashPassword = jest.fn().mockResolvedValue('$argon2id$newhash');
    mockRepo.updateUserPassword.mockResolvedValue(undefined);
    mockRepo.markPasswordResetTokenUsed.mockResolvedValue(undefined);
    mockRepo.revokeAllUserRefreshTokens.mockResolvedValue(undefined);

    await authService.resetPassword('valid-token', 'NewPass123!');

    expect(mockRepo.updateUserPassword).toHaveBeenCalledWith('user-uuid-1', '$argon2id$newhash');
    expect(mockRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith('user-uuid-1');
  });
});
