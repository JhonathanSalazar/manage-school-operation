import { z } from 'zod';

const userRoles = ['admin', 'teacher', 'student', 'custom'] as const;

export const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  targetRoles: z
    .array(z.enum(userRoles))
    .min(1, 'Select at least one target role'),
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type NoticeFormData = z.infer<typeof noticeSchema>;
