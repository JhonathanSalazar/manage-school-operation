import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '@shared/jwt';
import { ApiError } from '@utils/api-error';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
}
