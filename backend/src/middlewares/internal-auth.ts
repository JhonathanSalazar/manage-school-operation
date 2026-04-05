import { Request, Response, NextFunction } from 'express';
import { env } from '@config/env';
import { ApiError } from '@utils/api-error';

export function internalAuth(req: Request, _res: Response, next: NextFunction) {
  const secret = req.headers['x-internal-secret'];

  if (!secret || secret !== env.JAVA_INTERNAL_SECRET) {
    return next(ApiError.unauthorized('Invalid internal secret'));
  }

  return next();
}
