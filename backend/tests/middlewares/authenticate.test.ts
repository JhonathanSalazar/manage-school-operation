jest.mock('@config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test_access_secret_that_is_long_enough_32ch',
    JWT_REFRESH_SECRET: 'test_refresh_secret_that_is_long_enough_32c',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d',
  },
}));

import { Request, Response, NextFunction } from 'express';
import { authenticate } from '@middlewares/authenticate';
import { signAccessToken } from '@shared/jwt';
import { ApiError } from '@utils/api-error';

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;

function makeRequest(authHeader?: string): Partial<Request> {
  return { headers: authHeader ? { authorization: authHeader } : {} };
}

const mockRes = {} as Response;

beforeEach(() => mockNext.mockClear());

describe('authenticate middleware', () => {
  it('should attach req.user and call next for a valid token', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'admin', permissions: ['users:read'] });
    const req = makeRequest(`Bearer ${token}`) as Request;

    authenticate(req, mockRes, mockNext);

    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe('user-1');
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with 401 ApiError when no authorization header', () => {
    const req = makeRequest() as Request;
    authenticate(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const err = mockNext.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(401);
  });

  it('should call next with 401 ApiError when token is invalid', () => {
    const req = makeRequest('Bearer invalid.token.here') as Request;
    authenticate(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const err = mockNext.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(401);
  });

  it('should call next with 401 ApiError when header does not start with Bearer', () => {
    const req = makeRequest('Basic sometoken') as Request;
    authenticate(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
  });
});
