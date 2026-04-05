import { pool } from '@config/db';

export interface StudentRow {
  id: string;
  student_code: string;
  roll_number: string;
  date_of_birth: string;
  gender: string;
  phone: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  created_at: Date;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  section_id: number | null;
  section_name: string | null;
  class_id: number | null;
  class_name: string | null;
}

const STUDENT_SELECT = `
  SELECT
    s.id, s.student_code, s.roll_number, s.date_of_birth, s.gender,
    s.phone, s.address, s.guardian_name, s.guardian_phone, s.created_at,
    u.id as user_id, u.first_name, u.last_name, u.email,
    sec.id as section_id, sec.name as section_name,
    c.id as class_id, c.name as class_name
  FROM students s
  JOIN users u ON s.user_id = u.id
  LEFT JOIN sections sec ON s.section_id = sec.id
  LEFT JOIN classes c ON sec.class_id = c.id
`;

export async function findStudentById(id: string): Promise<StudentRow | null> {
  const result = await pool.query<StudentRow>(`${STUDENT_SELECT} WHERE s.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listStudents(
  offset: number,
  limit: number,
  sectionId?: number,
  classId?: number,
  search?: string,
): Promise<{ rows: StudentRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [limit, offset];

  if (sectionId) {
    params.push(sectionId);
    conditions.push(`s.section_id = $${params.length}`);
  }
  if (classId) {
    params.push(classId);
    conditions.push(`c.id = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length} OR s.student_code ILIKE $${params.length})`,
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [data, count] = await Promise.all([
    pool.query<StudentRow>(
      `${STUDENT_SELECT} ${where} ORDER BY u.last_name, u.first_name LIMIT $1 OFFSET $2`,
      params,
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       LEFT JOIN classes c ON sec.class_id = c.id
       ${where}`,
      params.slice(2),
    ),
  ]);

  return { rows: data.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function createStudent(fields: {
  userId: string;
  studentCode?: string;
  sectionId?: number;
  rollNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  guardianName: string;
  guardianPhone: string;
}): Promise<StudentRow> {
  const result = await pool.query<{ id: string }>(
    `INSERT INTO students
       (user_id, student_code, section_id, roll_number, date_of_birth, gender, phone, address, guardian_name, guardian_phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      fields.userId, fields.studentCode ?? null, fields.sectionId ?? null,
      fields.rollNumber ?? null, fields.dateOfBirth ?? null, fields.gender ?? null,
      fields.phone ?? null, fields.address ?? null, fields.guardianName, fields.guardianPhone,
    ],
  );
  return findStudentById(result.rows[0].id) as Promise<StudentRow>;
}

export async function updateStudent(
  id: string,
  fields: Partial<{
    sectionId: number; rollNumber: string; dateOfBirth: string; gender: string;
    phone: string; address: string; guardianName: string; guardianPhone: string;
  }>,
): Promise<StudentRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  const fieldMap: Record<string, string> = {
    sectionId: 'section_id', rollNumber: 'roll_number', dateOfBirth: 'date_of_birth',
    gender: 'gender', phone: 'phone', address: 'address',
    guardianName: 'guardian_name', guardianPhone: 'guardian_phone',
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
    await pool.query(`UPDATE students SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }

  return findStudentById(id);
}

export async function deleteStudent(id: string): Promise<void> {
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
}
