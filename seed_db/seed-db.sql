-- School Management System - Seed Data
-- Run AFTER tables.sql: psql -d school_mgmt -f seed_db/seed-db.sql
-- Demo credentials: admin@school-admin.com / 3OU4zn3q6Zh9

-- ============================================================
-- PERMISSIONS
-- ============================================================

INSERT INTO permissions (name, description) VALUES
  ('users:read',       'View user accounts'),
  ('users:write',      'Create and update user accounts'),
  ('students:read',    'View student profiles'),
  ('students:write',   'Create and update student profiles'),
  ('staff:read',       'View staff profiles'),
  ('staff:write',      'Create and update staff profiles'),
  ('classes:read',     'View classes and sections'),
  ('classes:write',    'Create and update classes and sections'),
  ('notices:read',     'View notices'),
  ('notices:write',    'Create and update notices'),
  ('notices:approve',  'Approve or reject notices'),
  ('leave:read',       'View leave requests'),
  ('leave:write',      'Submit leave requests'),
  ('leave:approve',    'Approve or reject leave requests'),
  ('dashboard:read',   'View dashboard statistics');

-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================

-- Admin: all permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- Teacher permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'teacher', id FROM permissions
WHERE name IN (
  'students:read', 'classes:read',
  'notices:read', 'notices:write',
  'leave:read', 'leave:write',
  'dashboard:read'
);

-- Student permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'student', id FROM permissions
WHERE name IN (
  'notices:read',
  'leave:read', 'leave:write',
  'dashboard:read'
);

-- ============================================================
-- USERS
-- ============================================================

-- Admin user (password: 3OU4zn3q6Zh9 — hashed with argon2id)
-- The hash below is a placeholder; the backend will re-hash via argon2 on first password reset.
-- For development, run the backend's hash-password utility to generate a real argon2 hash.
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@school-admin.com',
  '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash_will_be_replaced_on_first_login',
  'Admin',
  'User',
  'admin',
  true,
  true
);

-- Teacher users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'alice.teacher@school.com',   '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash', 'Alice',   'Johnson',  'teacher', true, true),
  ('00000000-0000-0000-0000-000000000003', 'bob.teacher@school.com',     '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash', 'Bob',     'Williams', 'teacher', true, true);

-- Student users
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES
  ('00000000-0000-0000-0000-000000000004', 'jane.doe@school.com',        '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash', 'Jane',    'Doe',      'student', true, true),
  ('00000000-0000-0000-0000-000000000005', 'john.smith@school.com',      '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash', 'John',    'Smith',    'student', true, true),
  ('00000000-0000-0000-0000-000000000006', 'maria.garcia@school.com',    '$argon2id$v=19$m=65536,t=3,p=4$placeholder$hash', 'Maria',   'Garcia',   'student', true, true);

-- ============================================================
-- DEPARTMENTS
-- ============================================================

INSERT INTO departments (id, name) VALUES
  (1, 'Mathematics'),
  (2, 'Science'),
  (3, 'English'),
  (4, 'Administration');

-- ============================================================
-- STAFF
-- ============================================================

INSERT INTO staff (id, user_id, employee_code, department_id, designation, join_date, phone)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'EMP-001', 4, 'Principal',       '2020-01-15', '+1-555-0100'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'EMP-002', 1, 'Math Teacher',    '2021-08-01', '+1-555-0101'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'EMP-003', 2, 'Science Teacher', '2022-01-10', '+1-555-0102');

-- ============================================================
-- CLASSES & SECTIONS
-- ============================================================

INSERT INTO classes (id, name) VALUES
  (1, 'Grade 9'),
  (2, 'Grade 10'),
  (3, 'Grade 11');

INSERT INTO sections (id, class_id, name, teacher_id, capacity) VALUES
  (1, 1, 'A', '10000000-0000-0000-0000-000000000002', 30),
  (2, 1, 'B', '10000000-0000-0000-0000-000000000003', 30),
  (3, 2, 'A', '10000000-0000-0000-0000-000000000002', 30),
  (4, 3, 'A', '10000000-0000-0000-0000-000000000003', 25);

-- ============================================================
-- STUDENTS
-- ============================================================

INSERT INTO students (id, user_id, student_code, section_id, roll_number, date_of_birth, gender, phone, address, guardian_name, guardian_phone)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'STU-001', 3, '01',
    '2007-03-15', 'female',
    '+1-555-0201', '123 Main St, Springfield',
    'Robert Doe', '+1-555-0200'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    'STU-002', 3, '02',
    '2007-06-22', 'male',
    '+1-555-0202', '456 Oak Ave, Springfield',
    'Linda Smith', '+1-555-0203'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000006',
    'STU-003', 1, '01',
    '2008-11-30', 'female',
    '+1-555-0204', '789 Pine Rd, Springfield',
    'Carlos Garcia', '+1-555-0205'
  );

-- ============================================================
-- NOTICES
-- ============================================================

INSERT INTO notices (title, content, status, created_by, approved_by, target_roles, publish_date)
VALUES
  (
    'Welcome Back to School',
    'Dear students and staff, welcome to the new academic year. We look forward to a productive and rewarding year ahead.',
    'approved',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    ARRAY['student', 'teacher']::user_role[],
    CURRENT_DATE
  ),
  (
    'Science Fair Registration Open',
    'Registration for the annual Science Fair is now open. Students interested in participating should submit their project proposals by the end of the month.',
    'approved',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    ARRAY['student']::user_role[],
    CURRENT_DATE
  ),
  (
    'Staff Meeting - Q2 Planning',
    'All staff members are required to attend the Q2 planning meeting scheduled for next Friday at 3:00 PM in the main conference room.',
    'pending',
    '00000000-0000-0000-0000-000000000002',
    NULL,
    ARRAY['teacher']::user_role[],
    NULL
  );

-- ============================================================
-- LEAVE POLICIES
-- ============================================================

INSERT INTO leave_policies (name, description, max_days_per_year, applicable_roles)
VALUES
  ('Student Medical Leave',   'Leave granted for medical reasons with supporting documentation.', 15, ARRAY['student']::user_role[]),
  ('Student Personal Leave',  'Leave for personal reasons, subject to approval.',                  5, ARRAY['student']::user_role[]),
  ('Staff Annual Leave',      'Annual paid leave entitlement for staff members.',                 20, ARRAY['teacher', 'admin']::user_role[]),
  ('Staff Sick Leave',        'Paid sick leave for staff members.',                               10, ARRAY['teacher', 'admin']::user_role[]);

-- ============================================================
-- LEAVE REQUESTS (sample)
-- ============================================================

INSERT INTO leave_requests (user_id, policy_id, start_date, end_date, reason, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000004',
    1,
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '9 days',
    'Medical appointment and recovery.',
    'pending'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    3,
    CURRENT_DATE + INTERVAL '14 days',
    CURRENT_DATE + INTERVAL '16 days',
    'Family event.',
    'approved'
  );

-- Reset sequences to avoid conflicts with future inserts
SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments));
SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes));
SELECT setval('sections_id_seq', (SELECT MAX(id) FROM sections));
SELECT setval('leave_policies_id_seq', (SELECT MAX(id) FROM leave_policies));
