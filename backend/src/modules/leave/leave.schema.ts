import { z } from 'zod';

export const CreateLeavePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  maxDaysPerYear: z.number().int().positive('Max days must be a positive number'),
  applicableRoles: z
    .array(z.enum(['admin', 'teacher', 'student', 'custom']))
    .min(1, 'At least one applicable role is required'),
});

export const UpdateLeavePolicySchema = CreateLeavePolicySchema.partial();

export const CreateLeaveRequestSchema = z
  .object({
    policyId: z.number().int().positive('Policy ID is required'),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
    reason: z.string().min(1, 'Reason is required'),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const ListLeaveRequestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  userId: z.string().uuid().optional(),
});

export type CreateLeavePolicyInput = z.infer<typeof CreateLeavePolicySchema>;
export type UpdateLeavePolicyInput = z.infer<typeof UpdateLeavePolicySchema>;
export type CreateLeaveRequestInput = z.infer<typeof CreateLeaveRequestSchema>;
export type ListLeaveRequestsQuery = z.infer<typeof ListLeaveRequestsQuerySchema>;
