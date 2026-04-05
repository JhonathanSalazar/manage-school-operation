import { z } from 'zod';

export const CreateStudentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  studentCode: z.string().min(1).optional(),
  sectionId: z.number().int().positive().optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
});

export const UpdateStudentSchema = CreateStudentSchema.partial().omit({ userId: true });

export const ListStudentsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sectionId: z.coerce.number().int().positive().optional(),
  classId: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type ListStudentsQuery = z.infer<typeof ListStudentsQuerySchema>;
