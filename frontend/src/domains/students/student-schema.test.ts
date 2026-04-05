import { studentSchema } from './student-schema';

describe('studentSchema', () => {
  const validData = {
    userId: '00000000-0000-0000-0000-000000000004',
    guardianName: 'Robert Doe',
    guardianPhone: '+1-555-0200',
  };

  it('should pass with minimal valid data', () => {
    expect(studentSchema.safeParse(validData).success).toBe(true);
  });

  it('should reject missing guardianName', () => {
    const result = studentSchema.safeParse({ ...validData, guardianName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing guardianPhone', () => {
    const result = studentSchema.safeParse({ ...validData, guardianPhone: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const result = studentSchema.safeParse({ ...validData, dateOfBirth: '15-03-2007' });
    expect(result.success).toBe(false);
  });

  it('should accept valid date format', () => {
    const result = studentSchema.safeParse({ ...validData, dateOfBirth: '2007-03-15' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid userId', () => {
    const result = studentSchema.safeParse({ ...validData, userId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});
