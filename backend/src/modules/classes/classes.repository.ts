import { pool } from '@config/db';

export interface ClassRow {
  id: number;
  name: string;
  created_at: Date;
}

export interface SectionRow {
  id: number;
  name: string;
  capacity: number | null;
  created_at: Date;
  class_id: number;
  class_name: string;
  teacher_id: string | null;
  teacher_first_name: string | null;
  teacher_last_name: string | null;
}

const SECTION_SELECT = `
  SELECT
    sec.id, sec.name, sec.capacity, sec.created_at,
    c.id as class_id, c.name as class_name,
    st.id as teacher_id, u.first_name as teacher_first_name, u.last_name as teacher_last_name
  FROM sections sec
  JOIN classes c ON sec.class_id = c.id
  LEFT JOIN staff st ON sec.teacher_id = st.id
  LEFT JOIN users u ON st.user_id = u.id
`;

export async function listClasses(): Promise<ClassRow[]> {
  const result = await pool.query<ClassRow>('SELECT id, name, created_at FROM classes ORDER BY name');
  return result.rows;
}

export async function findClassById(id: number): Promise<ClassRow | null> {
  const result = await pool.query<ClassRow>('SELECT id, name, created_at FROM classes WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}

export async function createClass(name: string): Promise<ClassRow> {
  const result = await pool.query<ClassRow>(
    'INSERT INTO classes (name) VALUES ($1) RETURNING id, name, created_at',
    [name],
  );
  return result.rows[0];
}

export async function updateClass(id: number, name: string): Promise<ClassRow | null> {
  const result = await pool.query<ClassRow>(
    'UPDATE classes SET name = $1 WHERE id = $2 RETURNING id, name, created_at',
    [name, id],
  );
  return result.rows[0] ?? null;
}

export async function deleteClass(id: number): Promise<void> {
  await pool.query('DELETE FROM classes WHERE id = $1', [id]);
}

export async function listSectionsByClass(classId: number): Promise<SectionRow[]> {
  const result = await pool.query<SectionRow>(`${SECTION_SELECT} WHERE sec.class_id = $1 ORDER BY sec.name`, [classId]);
  return result.rows;
}

export async function findSectionById(id: number): Promise<SectionRow | null> {
  const result = await pool.query<SectionRow>(`${SECTION_SELECT} WHERE sec.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function createSection(classId: number, name: string, teacherId?: string, capacity?: number): Promise<SectionRow> {
  const result = await pool.query<{ id: number }>(
    'INSERT INTO sections (class_id, name, teacher_id, capacity) VALUES ($1, $2, $3, $4) RETURNING id',
    [classId, name, teacherId ?? null, capacity ?? null],
  );
  return findSectionById(result.rows[0].id) as Promise<SectionRow>;
}

export async function updateSection(id: number, fields: { name?: string; teacherId?: string | null; capacity?: number }): Promise<SectionRow | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (fields.name !== undefined) { params.push(fields.name); sets.push(`name = $${params.length}`); }
  if (fields.teacherId !== undefined) { params.push(fields.teacherId); sets.push(`teacher_id = $${params.length}`); }
  if (fields.capacity !== undefined) { params.push(fields.capacity); sets.push(`capacity = $${params.length}`); }

  if (sets.length > 0) {
    params.push(id);
    await pool.query(`UPDATE sections SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
  }

  return findSectionById(id);
}

export async function deleteSection(id: number): Promise<void> {
  await pool.query('DELETE FROM sections WHERE id = $1', [id]);
}
