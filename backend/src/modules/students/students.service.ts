import { ApiError } from '@utils/api-error';
import { findUserById } from '@modules/users/users.repository';
import * as repo from './students.repository';
import type { CreateStudentInput, UpdateStudentInput, ListStudentsQuery } from './students.schema';

export function formatStudent(s: repo.StudentRow) {
  return {
    id: s.id,
    studentCode: s.student_code,
    firstName: s.first_name,
    lastName: s.last_name,
    email: s.email,
    dateOfBirth: s.date_of_birth,
    gender: s.gender,
    phone: s.phone,
    address: s.address,
    guardianName: s.guardian_name,
    guardianPhone: s.guardian_phone,
    rollNumber: s.roll_number,
    createdAt: s.created_at,
    ...(s.class_id ? { class: { id: s.class_id, name: s.class_name } } : {}),
    ...(s.section_id ? { section: { id: s.section_id, name: s.section_name } } : {}),
  };
}

export async function listStudents(query: ListStudentsQuery) {
  const offset = (query.page - 1) * query.limit;
  const { rows, total } = await repo.listStudents(
    offset, query.limit, query.sectionId, query.classId, query.search,
  );
  return {
    data: rows.map(formatStudent),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getStudentById(id: string) {
  const student = await repo.findStudentById(id);
  if (!student) throw ApiError.notFound('Student not found');
  return formatStudent(student);
}

export async function createStudent(input: CreateStudentInput) {
  const user = await findUserById(input.userId);
  if (!user) throw ApiError.badRequest('User not found');

  const student = await repo.createStudent({
    userId: input.userId,
    studentCode: input.studentCode,
    sectionId: input.sectionId,
    rollNumber: input.rollNumber,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    phone: input.phone,
    address: input.address,
    guardianName: input.guardianName,
    guardianPhone: input.guardianPhone,
  });

  return formatStudent(student);
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  const existing = await repo.findStudentById(id);
  if (!existing) throw ApiError.notFound('Student not found');

  const updated = await repo.updateStudent(id, {
    sectionId: input.sectionId,
    rollNumber: input.rollNumber,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    phone: input.phone,
    address: input.address,
    guardianName: input.guardianName,
    guardianPhone: input.guardianPhone,
  });

  return formatStudent(updated!);
}

export async function deleteStudent(id: string) {
  const existing = await repo.findStudentById(id);
  if (!existing) throw ApiError.notFound('Student not found');
  await repo.deleteStudent(id);
}
