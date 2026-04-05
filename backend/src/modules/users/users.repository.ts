import { pool } from '@config/db';

export interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, first_name, last_name, role, is_active, is_verified, created_at FROM users WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await pool.query<UserRow>(
    'SELECT id, email, first_name, last_name, role, is_active, is_verified, created_at FROM users WHERE email = $1',
    [email],
  );
  return result.rows[0] ?? null;
}

export async function listUsers(
  offset: number,
  limit: number,
  role?: string,
  search?: string,
): Promise<{ rows: UserRow[]; total: number }> {
  const params: unknown[] = [limit, offset];
  const conditions: string[] = [];

  if (role) {
    params.push(role);
    conditions.push(`role = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    pool.query<UserRow>(
      `SELECT id, email, first_name, last_name, role, is_active, is_verified, created_at
       FROM users ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM users ${where}`,
      params.slice(2),
    ),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function createUser(
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  role: string,
): Promise<UserRow> {
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, first_name, last_name, role, is_active, is_verified, created_at`,
    [email, passwordHash, firstName, lastName, role],
  );
  return result.rows[0];
}

export async function updateUser(
  id: string,
  fields: { firstName?: string; lastName?: string; role?: string; isActive?: boolean },
): Promise<UserRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (fields.firstName !== undefined) {
    params.push(fields.firstName);
    sets.push(`first_name = $${params.length}`);
  }
  if (fields.lastName !== undefined) {
    params.push(fields.lastName);
    sets.push(`last_name = $${params.length}`);
  }
  if (fields.role !== undefined) {
    params.push(fields.role);
    sets.push(`role = $${params.length}`);
  }
  if (fields.isActive !== undefined) {
    params.push(fields.isActive);
    sets.push(`is_active = $${params.length}`);
  }

  if (sets.length === 0) return findUserById(id);

  sets.push(`updated_at = NOW()`);
  params.push(id);

  const result = await pool.query<UserRow>(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length}
     RETURNING id, email, first_name, last_name, role, is_active, is_verified, created_at`,
    params,
  );
  return result.rows[0] ?? null;
}

export async function assignUserPermissions(userId: string, permissionIds: number[]): Promise<void> {
  // Replace all user-specific permissions
  await pool.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);
  if (permissionIds.length === 0) return;

  const values = permissionIds.map((_, i) => `($1, $${i + 2})`).join(', ');
  await pool.query(
    `INSERT INTO user_permissions (user_id, permission_id) VALUES ${values}`,
    [userId, ...permissionIds],
  );
}

export async function listPermissions(): Promise<{ id: number; name: string; description: string }[]> {
  const result = await pool.query('SELECT id, name, description FROM permissions ORDER BY name');
  return result.rows;
}
