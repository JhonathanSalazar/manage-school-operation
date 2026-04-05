import { Request, Response } from 'express';
import { LoginSchema, PasswordResetRequestSchema, PasswordResetSchema, EmailVerificationSchema } from './auth.schema';
import * as authService from './auth.service';
import { env } from '@config/env';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function login(req: Request, res: Response) {
  const body = LoginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, cookieOptions);

  res.json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
}

export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  if (refreshToken && req.user) {
    await authService.logout(req.user.sub, refreshToken);
  }

  res.clearCookie(REFRESH_TOKEN_COOKIE);
  res.json({ success: true, message: 'Logged out' });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const result = await authService.refresh(refreshToken);

  res.json({ success: true, data: { accessToken: result.accessToken } });
}

export async function requestPasswordReset(req: Request, res: Response) {
  const body = PasswordResetRequestSchema.parse(req.body);
  await authService.requestPasswordReset(body.email);
  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
}

export async function resetPassword(req: Request, res: Response) {
  const body = PasswordResetSchema.parse(req.body);
  await authService.resetPassword(body.token, body.password);
  res.json({ success: true, message: 'Password reset successfully' });
}

export async function verifyEmail(req: Request, res: Response) {
  const query = EmailVerificationSchema.parse(req.query);
  await authService.verifyEmail(query.token);
  res.json({ success: true, message: 'Email verified successfully' });
}
