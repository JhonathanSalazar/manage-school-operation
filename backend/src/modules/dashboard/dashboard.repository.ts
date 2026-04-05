import { pool } from '@config/db';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalStaff: number;
  pendingLeaveRequests: number;
  pendingNotices: number;
}

export interface BirthdayEntry {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  dateOfBirth: string;
}

export async function getStats(): Promise<DashboardStats> {
  const [students, teachers, classes, staff, pendingLeave, pendingNotices] = await Promise.all([
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM students'),
    pool.query<{ count: string }>("SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_active = true"),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM classes'),
    pool.query<{ count: string }>('SELECT COUNT(*) as count FROM staff'),
    pool.query<{ count: string }>("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'"),
    pool.query<{ count: string }>("SELECT COUNT(*) as count FROM notices WHERE status = 'pending'"),
  ]);

  return {
    totalStudents: parseInt(students.rows[0].count, 10),
    totalTeachers: parseInt(teachers.rows[0].count, 10),
    totalClasses: parseInt(classes.rows[0].count, 10),
    totalStaff: parseInt(staff.rows[0].count, 10),
    pendingLeaveRequests: parseInt(pendingLeave.rows[0].count, 10),
    pendingNotices: parseInt(pendingNotices.rows[0].count, 10),
  };
}

export async function getUpcomingBirthdays(): Promise<BirthdayEntry[]> {
  // Students with birthdays in the next 7 days (comparing month-day only)
  const result = await pool.query<{
    user_id: string; first_name: string; last_name: string; date_of_birth: string;
  }>(
    `SELECT u.id as user_id, u.first_name, u.last_name, s.date_of_birth
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.date_of_birth IS NOT NULL
       AND (
         TO_DATE(TO_CHAR(s.date_of_birth, 'YYYY') || '-' || TO_CHAR(s.date_of_birth, 'MM-DD'), 'YYYY-MM-DD')
           BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
         OR
         TO_DATE((EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1)::TEXT || '-' || TO_CHAR(s.date_of_birth, 'MM-DD'), 'YYYY-MM-DD')
           BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       )
     ORDER BY TO_CHAR(s.date_of_birth, 'MM-DD')
     LIMIT 20`,
  );

  return result.rows.map((r) => ({
    userId: r.user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    role: 'student',
    dateOfBirth: r.date_of_birth,
  }));
}

export async function getRecentApprovedNotices(userRole: string, limit = 5): Promise<{ id: string; title: string; publishDate: string | null; createdAt: Date }[]> {
  const result = await pool.query<{ id: string; title: string; publish_date: string | null; created_at: Date }>(
    `SELECT id, title, publish_date, created_at FROM notices
     WHERE status = 'approved' AND $1 = ANY(target_roles)
     ORDER BY created_at DESC LIMIT $2`,
    [userRole, limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    publishDate: r.publish_date,
    createdAt: r.created_at,
  }));
}

export async function getPendingLeaveRequests(limit = 10): Promise<{
  id: string; userId: string; firstName: string; lastName: string;
  startDate: string; endDate: string; policyName: string;
}[]> {
  const result = await pool.query<{
    id: string; user_id: string; first_name: string; last_name: string;
    start_date: string; end_date: string; policy_name: string;
  }>(
    `SELECT lr.id, lr.user_id, u.first_name, u.last_name,
            lr.start_date, lr.end_date, lp.name as policy_name
     FROM leave_requests lr
     JOIN users u ON lr.user_id = u.id
     JOIN leave_policies lp ON lr.policy_id = lp.id
     WHERE lr.status = 'pending'
     ORDER BY lr.created_at ASC LIMIT $1`,
    [limit],
  );
  return result.rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    firstName: r.first_name,
    lastName: r.last_name,
    startDate: r.start_date,
    endDate: r.end_date,
    policyName: r.policy_name,
  }));
}
