import { z } from 'zod';

export const studentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  studentCode: z.string().optional(),
  sectionId: z.number().int().positive().optional(),
  rollNumber: z.string().optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
    .optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  guardianName: z.string().min(1, 'Guardian name is required'),
  guardianPhone: z.string().min(1, 'Guardian phone is required'),
});

export type StudentFormData = z.infer<typeof studentSchema>;
