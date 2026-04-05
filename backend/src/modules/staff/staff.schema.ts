import { z } from 'zod';

export const CreateStaffSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  employeeCode: z.string().min(1).optional(),
  departmentId: z.number().int().positive().optional(),
  designation: z.string().min(1).optional(),
  joinDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const UpdateStaffSchema = CreateStaffSchema.partial().omit({ userId: true });

export const ListStaffQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  departmentId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export type CreateStaffInput = z.infer<typeof CreateStaffSchema>;
export type UpdateStaffInput = z.infer<typeof UpdateStaffSchema>;
export type ListStaffQuery = z.infer<typeof ListStaffQuerySchema>;
