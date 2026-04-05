import { pool } from '@config/db';

export interface LeavePolicyRow {
  id: number;
  name: string;
  description: string;
  max_days_per_year: number;
  applicable_roles: string[];
  created_at: Date;
}

export interface LeaveRequestRow {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  reviewed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  user_id: string;
  user_first_name: string;
  user_last_name: string;
  policy_id: number;
  policy_name: string;
  reviewed_by_id: string | null;
  reviewed_by_first: string | null;
  reviewed_by_last: string | null;
}

const REQUEST_SELECT = `
  SELECT
    lr.id, lr.start_date, lr.end_date, lr.reason, lr.status,
    lr.reviewed_at, lr.created_at, lr.updated_at,
    u.id as user_id, u.first_name as user_first_name, u.last_name as user_last_name,
    lp.id as policy_id, lp.name as policy_name,
    ru.id as reviewed_by_id, ru.first_name as reviewed_by_first, ru.last_name as reviewed_by_last
  FROM leave_requests lr
  JOIN users u ON lr.user_id = u.id
  JOIN leave_policies lp ON lr.policy_id = lp.id
  LEFT JOIN users ru ON lr.reviewed_by = ru.id
`;

export async function listPolicies(): Promise<LeavePolicyRow[]> {
  const result = await pool.query<LeavePolicyRow>(
    'SELECT id, name, description, max_days_per_year, applicable_roles, created_at FROM leave_policies ORDER BY name',
  );
  return result.rows;
}

export async function findPolicyById(id: number): Promise<LeavePolicyRow | null> {
  const result = await pool.query<LeavePolicyRow>(
    'SELECT id, name, description, max_days_per_year, applicable_roles, created_at FROM leave_policies WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function createPolicy(
  name: string, description: string | undefined, maxDaysPerYear: number, applicableRoles: string[],
): Promise<LeavePolicyRow> {
  const result = await pool.query<LeavePolicyRow>(
    `INSERT INTO leave_policies (name, description, max_days_per_year, applicable_roles)
     VALUES ($1, $2, $3, $4::user_role[])
     RETURNING id, name, description, max_days_per_year, applicable_roles, created_at`,
    [name, description ?? null, maxDaysPerYear, applicableRoles],
  );
  return result.rows[0];
}

export async function updatePolicy(
  id: number,
  fields: Partial<{ name: string; description: string; maxDaysPerYear: number; applicableRoles: string[] }>,
): Promise<LeavePolicyRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (fields.name !== undefined) { params.push(fields.name); sets.push(`name = $${params.length}`); }
  if (fields.description !== undefined) { params.push(fields.description); sets.push(`description = $${params.length}`); }
  if (fields.maxDaysPerYear !== undefined) { params.push(fields.maxDaysPerYear); sets.push(`max_days_per_year = $${params.length}`); }
  if (fields.applicableRoles !== undefined) { params.push(fields.applicableRoles); sets.push(`applicable_roles = $${params.length}::user_role[]`); }

  if (sets.length > 0) {
    params.push(id);
    await pool.query(
      `UPDATE leave_policies SET ${sets.join(', ')} WHERE id = $${params.length}`,
      params,
    );
  }

  return findPolicyById(id);
}

export async function findRequestById(id: string): Promise<LeaveRequestRow | null> {
  const result = await pool.query<LeaveRequestRow>(`${REQUEST_SELECT} WHERE lr.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listRequests(
  offset: number, limit: number, userId?: string, status?: string, isAdmin = false,
): Promise<{ rows: LeaveRequestRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [limit, offset];

  if (!isAdmin) {
    params.push(userId);
    conditions.push(`lr.user_id = $${params.length}`);
  } else if (userId) {
    params.push(userId);
    conditions.push(`lr.user_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`lr.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [data, count] = await Promise.all([
    pool.query<LeaveRequestRow>(
      `${REQUEST_SELECT} ${where} ORDER BY lr.created_at DESC LIMIT $1 OFFSET $2`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM leave_requests lr ${where}`,
      params.slice(2),
    ),
  ]);

  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function getDaysUsedInYear(userId: string, policyId: number): Promise<number> {
  const year = new Date().getFullYear();
  const result = await pool.query<{ total: string }>(
    `SELECT COALESCE(SUM(end_date - start_date + 1), 0) as total
     FROM leave_requests
     WHERE user_id = $1 AND policy_id = $2 AND status = 'approved'
       AND EXTRACT(YEAR FROM start_date) = $3`,
    [userId, policyId, year],
  );
  return parseInt(result.rows[0].total, 10);
}

export async function hasOverlappingRequest(userId: string, startDate: string, endDate: string): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM leave_requests
     WHERE user_id = $1 AND status = 'pending'
       AND NOT (end_date < $2 OR start_date > $3)`,
    [userId, startDate, endDate],
  );
  return parseInt(result.rows[0].count, 10) > 0;
}

export async function createRequest(
  userId: string, policyId: number, startDate: string, endDate: string, reason: string,
): Promise<LeaveRequestRow> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO leave_requests (user_id, policy_id, start_date, end_date, reason)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [userId, policyId, startDate, endDate, reason],
  );
  return findRequestById(result.rows[0].id) as Promise<LeaveRequestRow>;
}

export async function updateRequestStatus(id: string, status: string, reviewedBy: string): Promise<void> {
  await pool.query(
    'UPDATE leave_requests SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW() WHERE id = $3',
    [status, reviewedBy, id],
  );
}
