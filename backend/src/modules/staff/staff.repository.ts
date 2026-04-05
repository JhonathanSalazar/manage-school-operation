import { pool } from '@config/db';

export interface StaffRow {
  id: string;
  employee_code: string;
  designation: string;
  join_date: string;
  phone: string;
  address: string;
  created_at: Date;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: number | null;
  department_name: string | null;
}

const STAFF_SELECT = `
  SELECT
    st.id, st.employee_code, st.designation, st.join_date,
    st.phone, st.address, st.created_at,
    u.id as user_id, u.first_name, u.last_name, u.email,
    d.id as department_id, d.name as department_name
  FROM staff st
  JOIN users u ON st.user_id = u.id
  LEFT JOIN departments d ON st.department_id = d.id
`;

export async function findStaffById(id: string): Promise<StaffRow | null> {
  const result = await pool.query<StaffRow>(`${STAFF_SELECT} WHERE st.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function findStaffByUserId(userId: string): Promise<StaffRow | null> {
  const result = await pool.query<StaffRow>(`${STAFF_SELECT} WHERE st.user_id = $1`, [userId]);
  return result.rows[0] ?? null;
}

export async function listStaff(
  offset: number,
  limit: number,
  departmentId?: number,
  search?: string,
): Promise<{ rows: StaffRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [limit, offset];

  if (departmentId) {
    params.push(departmentId);
    conditions.push(`st.department_id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR st.employee_code ILIKE $${params.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [data, count] = await Promise.all([
    pool.query<StaffRow>(
      `${STAFF_SELECT} ${where} ORDER BY u.last_name, u.first_name LIMIT $1 OFFSET $2`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM staff st JOIN users u ON st.user_id = u.id ${where}`,
      params.slice(2),
    ),
  ]);

  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function createStaff(fields: {
  userId: string;
  employeeCode?: string;
  departmentId?: number;
  designation?: string;
  joinDate?: string;
  phone?: string;
  address?: string;
}): Promise<StaffRow> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO staff (user_id, employee_code, department_id, designation, join_date, phone, address)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      fields.userId, fields.employeeCode ?? null, fields.departmentId ?? null,
      fields.designation ?? null, fields.joinDate ?? null,
      fields.phone ?? null, fields.address ?? null,
    ],
  );
  return findStaffById(result.rows[0].id) as Promise<StaffRow>;
}

export async function updateStaff(
  id: string,
  fields: Partial<{ departmentId: number; designation: string; joinDate: string; phone: string; address: string }>,
): Promise<StaffRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  const fieldMap: Record<string, string> = {
    departmentId: 'department_id', designation: 'designation',
    joinDate: 'join_date', phone: 'phone', address: 'address',
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    const val = (fields as Record<string, unknown>)[key];
    if (val !== undefined) {
      params.push(val);
      sets.push(`${col} = $${params.length}`);
    }
  }

  if (sets.length > 0) {
    sets.push('updated_at = NOW()');
    params.push(id);
    await pool.query(`UPDATE staff SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }

  return findStaffById(id);
}

export async function listDepartments(): Promise<{ id: number; name: string }[]> {
  const result = await pool.query<{ id: number; name: string }>(
    'SELECT id, name FROM departments ORDER BY name',
  );
  return result.rows;
}
