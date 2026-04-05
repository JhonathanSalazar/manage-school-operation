import { ApiError } from '@utils/api-error';
import { findStaffById } from '@modules/staff/staff.repository';
import * as repo from './classes.repository';
import type { CreateClassInput, CreateSectionInput, UpdateSectionInput } from './classes.schema';

function formatSection(s: repo.SectionRow) {
  return {
    id: s.id,
    name: s.name,
    capacity: s.capacity,
    createdAt: s.created_at,
    class: { id: s.class_id, name: s.class_name },
    ...(s.teacher_id
      ? { teacher: { id: s.teacher_id, firstName: s.teacher_first_name, lastName: s.teacher_last_name } }
      : { teacher: null }),
  };
}

export async function listClasses() {
  const classes = await repo.listClasses();
  return classes.map((c) => ({ id: c.id, name: c.name, createdAt: c.created_at }));
}

export async function createClass(input: CreateClassInput) {
  const cls = await repo.createClass(input.name);
  return { id: cls.id, name: cls.name, createdAt: cls.created_at };
}

export async function updateClass(id: number, name: string) {
  const cls = await repo.updateClass(id, name);
  if (!cls) throw ApiError.notFound('Class not found');
  return { id: cls.id, name: cls.name, createdAt: cls.created_at };
}

export async function deleteClass(id: number) {
  const cls = await repo.findClassById(id);
  if (!cls) throw ApiError.notFound('Class not found');
  await repo.deleteClass(id);
}

export async function listSectionsForClass(classId: number) {
  const cls = await repo.findClassById(classId);
  if (!cls) throw ApiError.notFound('Class not found');
  const sections = await repo.listSectionsByClass(classId);
  return sections.map(formatSection);
}

export async function createSection(classId: number, input: CreateSectionInput) {
  const cls = await repo.findClassById(classId);
  if (!cls) throw ApiError.notFound('Class not found');

  if (input.teacherId) {
    const staff = await findStaffById(input.teacherId);
    if (!staff) throw ApiError.badRequest('Teacher ID does not correspond to a staff member');
  }

  const section = await repo.createSection(classId, input.name, input.teacherId, input.capacity);
  return formatSection(section);
}

export async function updateSection(id: number, input: UpdateSectionInput) {
  const existing = await repo.findSectionById(id);
  if (!existing) throw ApiError.notFound('Section not found');

  if (input.teacherId) {
    const staff = await findStaffById(input.teacherId);
    if (!staff) throw ApiError.badRequest('Teacher ID does not correspond to a staff member');
  }

  const updated = await repo.updateSection(id, {
    name: input.name,
    teacherId: input.teacherId,
    capacity: input.capacity,
  });

  return formatSection(updated!);
}

export async function deleteSection(id: number) {
  const existing = await repo.findSectionById(id);
  if (!existing) throw ApiError.notFound('Section not found');
  await repo.deleteSection(id);
}
