import { ApiError } from '@utils/api-error';
import { findUserById } from '@modules/users/users.repository';
import * as repo from './staff.repository';
import type { CreateStaffInput, UpdateStaffInput, ListStaffQuery } from './staff.schema';

function formatStaff(s: repo.StaffRow) {
  return {
    id: s.id,
    employeeCode: s.employee_code,
    designation: s.designation,
    joinDate: s.join_date,
    phone: s.phone,
    address: s.address,
    createdAt: s.created_at,
    user: { id: s.user_id, firstName: s.first_name, lastName: s.last_name, email: s.email },
    ...(s.department_id ? { department: { id: s.department_id, name: s.department_name } } : {}),
  };
}

export async function listStaff(query: ListStaffQuery) {
  const offset = (query.page - 1) * query.limit;
  const { rows, total } = await repo.listStaff(offset, query.limit, query.departmentId, query.search);
  return {
    data: rows.map(formatStaff),
    pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
  };
}

export async function getStaffById(id: string) {
  const staff = await repo.findStaffById(id);
  if (!staff) throw ApiError.notFound('Staff member not found');
  return formatStaff(staff);
}

export async function createStaff(input: CreateStaffInput) {
  const user = await findUserById(input.userId);
  if (!user) throw ApiError.badRequest('User not found');
  if (!['teacher', 'admin'].includes(user.role)) {
    throw ApiError.badRequest('Only users with teacher or admin role can be added as staff');
  }

  const existing = await repo.findStaffByUserId(input.userId);
  if (existing) throw ApiError.conflict('User is already a staff member');

  const staff = await repo.createStaff({
    userId: input.userId,
    employeeCode: input.employeeCode,
    departmentId: input.departmentId,
    designation: input.designation,
    joinDate: input.joinDate,
    phone: input.phone,
    address: input.address,
  });

  return formatStaff(staff);
}

export async function updateStaff(id: string, input: UpdateStaffInput) {
  const existing = await repo.findStaffById(id);
  if (!existing) throw ApiError.notFound('Staff member not found');

  const updated = await repo.updateStaff(id, {
    departmentId: input.departmentId,
    designation: input.designation,
    joinDate: input.joinDate,
    phone: input.phone,
    address: input.address,
  });

  return formatStaff(updated!);
}

export async function listDepartments() {
  return repo.listDepartments();
}
