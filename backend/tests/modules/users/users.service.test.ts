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

jest.mock('@modules/users/users.repository');
jest.mock('@shared/password');
jest.mock('@modules/auth/auth.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));

import * as repo from '@modules/users/users.repository';
import * as passwordUtils from '@shared/password';
import * as usersService from '@modules/users/users.service';

const mockRepo = repo as jest.Mocked<typeof repo>;
const mockPasswordUtils = passwordUtils as jest.Mocked<typeof passwordUtils>;

const fakeUser: repo.UserRow = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'teacher',
  is_active: true,
  is_verified: false,
  created_at: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe('usersService.createUser', () => {
  it('should create a user and send a verification email', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(null);
    mockPasswordUtils.hashPassword = jest.fn().mockResolvedValue('$argon2id$hash');
    mockRepo.createUser.mockResolvedValue(fakeUser);

    const result = await usersService.createUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'teacher',
    });

    expect(result.email).toBe('test@example.com');
    expect(mockRepo.createUser).toHaveBeenCalled();
  });

  it('should throw 409 when email is already in use', async () => {
    mockRepo.findUserByEmail.mockResolvedValue(fakeUser);

    await expect(
      usersService.createUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'teacher',
      }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('usersService.deactivateUser', () => {
  it('should set is_active to false', async () => {
    mockRepo.findUserById.mockResolvedValue(fakeUser);
    mockRepo.updateUser.mockResolvedValue({ ...fakeUser, is_active: false });

    await usersService.deactivateUser('user-uuid-1');

    expect(mockRepo.updateUser).toHaveBeenCalledWith('user-uuid-1', { isActive: false });
  });

  it('should throw 404 when user does not exist', async () => {
    mockRepo.findUserById.mockResolvedValue(null);

    await expect(usersService.deactivateUser('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('usersService.assignPermissions', () => {
  it('should throw 400 when user role is not "custom"', async () => {
    mockRepo.findUserById.mockResolvedValue({ ...fakeUser, role: 'teacher' });

    await expect(usersService.assignPermissions('user-uuid-1', [1, 2])).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it('should assign permissions for a "custom" role user', async () => {
    mockRepo.findUserById.mockResolvedValue({ ...fakeUser, role: 'custom' });
    mockRepo.assignUserPermissions.mockResolvedValue(undefined);

    await usersService.assignPermissions('user-uuid-1', [1, 2, 3]);

    expect(mockRepo.assignUserPermissions).toHaveBeenCalledWith('user-uuid-1', [1, 2, 3]);
  });
});
