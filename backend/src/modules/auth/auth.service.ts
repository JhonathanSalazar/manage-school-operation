import crypto from 'crypto';
import { env } from '@config/env';
import { verifyPassword, hashPassword } from '@shared/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@shared/jwt';
import { ApiError } from '@utils/api-error';
import { sendEmail } from '@utils/send-email';
import * as repo from './auth.repository';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  permissions: string[];
}

export async function login(email: string, password: string): Promise<AuthTokens & { user: { id: string; firstName: string; lastName: string; role: string } }> {
  const user = await repo.findUserByEmail(email);

  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const permissions =
    user.role === 'custom'
      ? await repo.getPermissionsForUser(user.id)
      : await repo.getPermissionsForRole(user.role);

  const accessToken = signAccessToken({
    sub: user.id,
    role: user.role,
    permissions,
  });

  const rawRefreshToken = crypto.randomBytes(32).toString('hex');
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await repo.storeRefreshToken(user.id, rawRefreshToken, refreshExpiresAt);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    permissions,
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    },
  };
}

export async function refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(rawRefreshToken) as { sub: string };
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const valid = await repo.findValidRefreshToken(payload.sub, rawRefreshToken);
  if (!valid) {
    throw ApiError.unauthorized('Refresh token has been revoked or expired');
  }

  // Rotate: revoke old, issue new
  await repo.revokeRefreshToken(payload.sub, rawRefreshToken);

  const user = await repo.findUserByEmail(payload.sub).catch(() => null);
  // Re-fetch permissions (role may have changed)
  const permissions = await repo.getPermissionsForRole(payload.sub);

  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await repo.storeRefreshToken(payload.sub, newRefreshToken, refreshExpiresAt);

  const accessToken = signAccessToken({
    sub: payload.sub,
    role: user?.role ?? 'student',
    permissions,
  });

  return { accessToken };
}

export async function logout(userId: string, rawRefreshToken: string): Promise<void> {
  await repo.revokeRefreshToken(userId, rawRefreshToken);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const user = await repo.findUserByEmail(email);
  // Return silently even if user not found to prevent email enumeration
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await repo.storePasswordResetToken(user.id, rawToken, expiresAt);

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const record = await repo.findValidPasswordResetToken(rawToken);
  if (!record) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(newPassword);
  await repo.updateUserPassword(record.userId, passwordHash);
  await repo.markPasswordResetTokenUsed(rawToken);
  await repo.revokeAllUserRefreshTokens(record.userId);
}

export async function verifyEmail(rawToken: string): Promise<void> {
  const record = await repo.verifyEmailToken(rawToken);
  if (!record) {
    throw ApiError.badRequest('Invalid or expired verification token');
  }
}

export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await repo.storeEmailVerificationToken(userId, rawToken, expiresAt);

  const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${rawToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `<p>Click <a href="${verifyLink}">here</a> to verify your email address.</p>`,
  });
}
