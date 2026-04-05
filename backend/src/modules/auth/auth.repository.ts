import { pool } from '@config/db';
import { hashToken } from '@shared/token-hash';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, password_hash, first_name, last_name, role, is_active, is_verified FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
}

export async function storeRefreshToken(userId: string, rawToken: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(rawToken), expiresAt],
  );
}

export async function findValidRefreshToken(userId: string, rawToken: string): Promise<boolean> {
  const tokenHash = hashToken(rawToken);
  const result = await pool.query(
    'SELECT id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked = false AND expires_at > NOW()',
    [userId, tokenHash],
  );
  return result.rows.length > 0;
}

export async function revokeRefreshToken(userId: string, rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await pool.query(
    'UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND token_hash = $2',
    [userId, tokenHash],
  );
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await pool.query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1', [userId]);
}

export async function storePasswordResetToken(userId: string, rawToken: string, expiresAt: Date): Promise<void> {
  // Invalidate any existing unused tokens first
  await pool.query(
    'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
    [userId],
  );
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(rawToken), expiresAt],
  );
}

export async function findValidPasswordResetToken(rawToken: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(rawToken);
  const result = await pool.query<{ user_id: string }>(
    'SELECT user_id FROM password_reset_tokens WHERE token_hash = $1 AND used = false AND expires_at > NOW()',
    [tokenHash],
  );
  if (!result.rows[0]) return null;
  return { userId: result.rows[0].user_id };
}

export async function markPasswordResetTokenUsed(rawToken: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  await pool.query('UPDATE password_reset_tokens SET used = true WHERE token_hash = $1', [tokenHash]);
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    passwordHash,
    userId,
  ]);
}

export async function storeEmailVerificationToken(userId: string, rawToken: string, expiresAt: Date): Promise<void> {
  await pool.query(
    'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hashToken(rawToken), expiresAt],
  );
}

export async function verifyEmailToken(rawToken: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(rawToken);
  const result = await pool.query<{ user_id: string }>(
    'SELECT user_id FROM email_verifications WHERE token_hash = $1 AND verified = false AND expires_at > NOW()',
    [tokenHash],
  );
  if (!result.rows[0]) return null;
  await pool.query(
    'UPDATE email_verifications SET verified = true WHERE token_hash = $1',
    [tokenHash],
  );
  await pool.query('UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1', [
    result.rows[0].user_id,
  ]);
  return { userId: result.rows[0].user_id };
}

export async function getPermissionsForRole(role: string): Promise<string[]> {
  const result = await pool.query<{ name: string }>(
    `SELECT p.name FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role = $1`,
    [role],
  );
  return result.rows.map((r) => r.name);
}

export async function getPermissionsForUser(userId: string): Promise<string[]> {
  const result = await pool.query<{ name: string }>(
    `SELECT p.name FROM permissions p
     JOIN user_permissions up ON p.id = up.permission_id
     WHERE up.user_id = $1`,
    [userId],
  );
  return result.rows.map((r) => r.name);
}
