import { hashPassword } from '@shared/password';
import { ApiError } from '@utils/api-error';
import { sendVerificationEmail } from '@modules/auth/auth.service';
import * as repo from './users.repository';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from './users.schema';

export async function listUsers(query: ListUsersQuery) {
  const offset = (query.page - 1) * query.limit;
  const { rows, total } = await repo.listUsers(offset, query.limit, query.role, query.search);

  return {
    data: rows.map(formatUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

export async function getUserById(id: string) {
  const user = await repo.findUserById(id);
  if (!user) throw ApiError.notFound('User not found');
  return formatUser(user);
}

export async function createUser(input: CreateUserInput) {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) throw ApiError.conflict('Email is already in use');

  const passwordHash = await hashPassword(input.password);
  const user = await repo.createUser(
    input.email,
    passwordHash,
    input.firstName,
    input.lastName,
    input.role,
  );

  await sendVerificationEmail(user.id, user.email).catch(() => {
    // Log but don't fail — user was created successfully
    console.error(`Failed to send verification email to ${user.email}`);
  });

  return formatUser(user);
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const existing = await repo.findUserById(id);
  if (!existing) throw ApiError.notFound('User not found');

  const updated = await repo.updateUser(id, {
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role,
    isActive: input.isActive,
  });

  return formatUser(updated!);
}

export async function deactivateUser(id: string) {
  const existing = await repo.findUserById(id);
  if (!existing) throw ApiError.notFound('User not found');

  await repo.updateUser(id, { isActive: false });
}

export async function assignPermissions(userId: string, permissionIds: number[]) {
  const user = await repo.findUserById(userId);
  if (!user) throw ApiError.notFound('User not found');

  if (user.role !== 'custom') {
    throw ApiError.badRequest('Permissions can only be assigned to users with the "custom" role');
  }

  await repo.assignUserPermissions(userId, permissionIds);
}

export async function listPermissions() {
  return repo.listPermissions();
}

function formatUser(user: repo.UserRow) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    isActive: user.is_active,
    isVerified: user.is_verified,
    createdAt: user.created_at,
  };
}
