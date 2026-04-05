import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '@utils/api-error';

export function authorize(...required: string[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    const hasAll = required.every((perm) => req.user!.permissions.includes(perm));

    if (!hasAll) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }

    return next();
  };
}
