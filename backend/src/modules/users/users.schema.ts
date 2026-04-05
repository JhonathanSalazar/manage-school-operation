import { z } from 'zod';

const userRoles = ['admin', 'teacher', 'student', 'custom'] as const;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(userRoles).default('student'),
});

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(userRoles).optional(),
  isActive: z.boolean().optional(),
});

export const AssignPermissionsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()).min(1),
});

export const ListUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  role: z.enum(userRoles).optional(),
  search: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type AssignPermissionsInput = z.infer<typeof AssignPermissionsSchema>;
export type ListUsersQuery = z.infer<typeof ListUsersQuerySchema>;
