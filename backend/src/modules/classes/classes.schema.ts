import { z } from 'zod';

export const CreateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
});

export const UpdateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
});

export const CreateSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  teacherId: z.string().uuid().optional(),
  capacity: z.number().int().positive().optional(),
});

export const UpdateSectionSchema = z.object({
  name: z.string().min(1).optional(),
  teacherId: z.string().uuid().nullable().optional(),
  capacity: z.number().int().positive().optional(),
});

export const AssignTeacherSchema = z.object({
  teacherId: z.string().uuid().nullable(),
});

export type CreateClassInput = z.infer<typeof CreateClassSchema>;
export type CreateSectionInput = z.infer<typeof CreateSectionSchema>;
export type UpdateSectionInput = z.infer<typeof UpdateSectionSchema>;
