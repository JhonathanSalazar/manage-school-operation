-- School Management System - Database Schema
-- Run: psql -d school_mgmt -f seed_db/tables.sql

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student', 'custom');
CREATE TYPE notice_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  role          user_role NOT NULL DEFAULT 'student',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_verified   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ============================================================
-- PERMISSIONS & RBAC
-- ============================================================

CREATE TABLE permissions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE role_permissions (
  role          user_role NOT NULL,
  permission_id INT NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (role, permission_id)
);

CREATE TABLE user_permissions (
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  permission_id INT NOT NULL REFERENCES permissions (id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, permission_id)
);

-- ============================================================
-- TOKEN TABLES
-- ============================================================

CREATE TABLE refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE TABLE password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_verifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEPARTMENTS & STAFF
-- ============================================================

CREATE TABLE departments (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  employee_code VARCHAR(50) UNIQUE,
  department_id INT REFERENCES departments (id) ON DELETE SET NULL,
  designation   VARCHAR(100),
  join_date     DATE,
  phone         VARCHAR(20),
  address       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_department_id ON staff (department_id);

-- ============================================================
-- CLASSES & SECTIONS
-- ============================================================

CREATE TABLE classes (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sections (
  id         SERIAL PRIMARY KEY,
  class_id   INT NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
  name       VARCHAR(50) NOT NULL,
  teacher_id UUID REFERENCES staff (id) ON DELETE SET NULL,
  capacity   INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sections_class_id ON sections (class_id);
CREATE INDEX idx_sections_teacher_id ON sections (teacher_id);

-- ============================================================
-- STUDENTS
-- ============================================================

CREATE TABLE students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
  student_code   VARCHAR(50) UNIQUE,
  section_id     INT REFERENCES sections (id) ON DELETE SET NULL,
  roll_number    VARCHAR(20),
  date_of_birth  DATE,
  gender         VARCHAR(10),
  phone          VARCHAR(20),
  address        TEXT,
  guardian_name  VARCHAR(200),
  guardian_phone VARCHAR(20),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_section_id ON students (section_id);
CREATE INDEX idx_students_date_of_birth ON students (date_of_birth);

-- ============================================================
-- NOTICES
-- ============================================================

CREATE TABLE notices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  content      TEXT NOT NULL,
  status       notice_status NOT NULL DEFAULT 'draft',
  created_by   UUID NOT NULL REFERENCES users (id),
  approved_by  UUID REFERENCES users (id),
  target_roles user_role[] NOT NULL DEFAULT '{}',
  publish_date DATE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_status ON notices (status);
CREATE INDEX idx_notices_created_by ON notices (created_by);

-- ============================================================
-- LEAVE MANAGEMENT
-- ============================================================

CREATE TABLE leave_policies (
  id                 SERIAL PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  description        TEXT,
  max_days_per_year  INT NOT NULL,
  applicable_roles   user_role[] NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leave_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  policy_id    INT NOT NULL REFERENCES leave_policies (id),
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  reason       TEXT NOT NULL,
  status       leave_status NOT NULL DEFAULT 'pending',
  reviewed_by  UUID REFERENCES users (id),
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_user_id ON leave_requests (user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests (status);
