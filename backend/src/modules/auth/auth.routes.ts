import { Router } from 'express';
import { asyncHandler } from '@utils/async-handler';
import { authenticate } from '@middlewares/authenticate';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(controller.login));
authRouter.post('/logout', authenticate, asyncHandler(controller.logout));
authRouter.get('/refresh', asyncHandler(controller.refresh));
authRouter.post('/password-reset/request', asyncHandler(controller.requestPasswordReset));
authRouter.post('/password-reset/confirm', asyncHandler(controller.resetPassword));
authRouter.get('/verify-email', asyncHandler(controller.verifyEmail));
