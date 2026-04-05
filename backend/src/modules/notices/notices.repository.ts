import { pool } from '@config/db';

export interface NoticeRow {
  id: string;
  title: string;
  content: string;
  status: string;
  target_roles: string[];
  publish_date: string | null;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
  created_by_first: string;
  created_by_last: string;
  approved_by_id: string | null;
  approved_by_first: string | null;
  approved_by_last: string | null;
}

const NOTICE_SELECT = `
  SELECT
    n.id, n.title, n.content, n.status, n.target_roles, n.publish_date,
    n.created_at, n.updated_at,
    cu.id as created_by_id, cu.first_name as created_by_first, cu.last_name as created_by_last,
    au.id as approved_by_id, au.first_name as approved_by_first, au.last_name as approved_by_last
  FROM notices n
  JOIN users cu ON n.created_by = cu.id
  LEFT JOIN users au ON n.approved_by = au.id
`;

export async function findNoticeById(id: string): Promise<NoticeRow | null> {
  const result = await pool.query<NoticeRow>(`${NOTICE_SELECT} WHERE n.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listNotices(
  offset: number,
  limit: number,
  userRole: string,
  status?: string,
  isAdmin = false,
): Promise<{ rows: NoticeRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [limit, offset];

  // Non-admins only see approved notices targeting their role
  if (!isAdmin) {
    params.push(userRole);
    conditions.push(`n.status = 'approved' AND $${params.length} = ANY(n.target_roles)`);
  } else if (status) {
    params.push(status);
    conditions.push(`n.status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [data, count] = await Promise.all([
    pool.query<NoticeRow>(
      `${NOTICE_SELECT} ${where} ORDER BY n.created_at DESC LIMIT $1 OFFSET $2`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notices n ${where}`,
      params.slice(2),
    ),
  ]);

  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function createNotice(
  title: string, content: string, createdBy: string, targetRoles: string[], publishDate?: string,
): Promise<NoticeRow> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO notices (title, content, created_by, target_roles, publish_date, status)
     VALUES ($1, $2, $3, $4::user_role[], $5, 'draft') RETURNING id`,
    [title, content, createdBy, targetRoles, publishDate ?? null],
  );
  return findNoticeById(result.rows[0].id) as Promise<NoticeRow>;
}

export async function updateNotice(
  id: string,
  fields: { title?: string; content?: string; targetRoles?: string[]; publishDate?: string },
): Promise<NoticeRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (fields.title !== undefined) { params.push(fields.title); sets.push(`title = $${params.length}`); }
  if (fields.content !== undefined) { params.push(fields.content); sets.push(`content = $${params.length}`); }
  if (fields.targetRoles !== undefined) { params.push(fields.targetRoles); sets.push(`target_roles = $${params.length}::user_role[]`); }
  if (fields.publishDate !== undefined) { params.push(fields.publishDate); sets.push(`publish_date = $${params.length}`); }

  if (sets.length > 0) {
    sets.push('updated_at = NOW()');
    params.push(id);
    await pool.query(`UPDATE notices SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }

  return findNoticeById(id);
}

export async function updateNoticeStatus(id: string, status: string, approvedBy?: string): Promise<void> {
  await pool.query(
    'UPDATE notices SET status = $1, approved_by = $2, updated_at = NOW() WHERE id = $3',
    [status, approvedBy ?? null, id],
  );
}

export async function deleteNotice(id: string): Promise<void> {
  await pool.query('DELETE FROM notices WHERE id = $1', [id]);
}
