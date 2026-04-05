import { Request, Response, NextFunction } from 'express';
import { authorize } from '@middlewares/authorize';
import { ApiError } from '@utils/api-error';

const mockNext = jest.fn() as jest.MockedFunction<NextFunction>;
const mockRes = {} as Response;

beforeEach(() => mockNext.mockClear());

function makeRequest(permissions: string[]): Partial<Request> {
  return {
    user: { sub: 'user-1', role: 'teacher', permissions },
  };
}

describe('authorize middleware', () => {
  it('should call next() when user has the required permission', () => {
    const req = makeRequest(['students:read', 'notices:write']) as Request;
    authorize('students:read')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next() when user has all required permissions', () => {
    const req = makeRequest(['students:read', 'notices:write']) as Request;
    authorize('students:read', 'notices:write')(req, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should call next with 403 when user is missing a required permission', () => {
    const req = makeRequest(['students:read']) as Request;
    authorize('notices:approve')(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const err = mockNext.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(403);
  });

  it('should call next with 401 when req.user is not set', () => {
    const req = { user: undefined } as unknown as Request;
    authorize('students:read')(req, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
    const err = mockNext.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(401);
  });
});
