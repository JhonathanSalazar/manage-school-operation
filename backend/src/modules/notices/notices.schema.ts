import { z } from 'zod';

const userRoles = ['admin', 'teacher', 'student', 'custom'] as const;

export const CreateNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  targetRoles: z.array(z.enum(userRoles)).min(1, 'At least one target role is required'),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const UpdateNoticeSchema = CreateNoticeSchema.partial();

export const ListNoticesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'pending', 'approved', 'rejected']).optional(),
});

export type CreateNoticeInput = z.infer<typeof CreateNoticeSchema>;
export type UpdateNoticeInput = z.infer<typeof UpdateNoticeSchema>;
export type ListNoticesQuery = z.infer<typeof ListNoticesQuerySchema>;
