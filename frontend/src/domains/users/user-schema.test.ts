import { createUserSchema } from './user-schema';

describe('createUserSchema', () => {
  const validData = {
    email: 'user@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'teacher' as const,
  };

  it('should pass with valid data', () => {
    expect(createUserSchema.safeParse(validData).success).toBe(true);
  });

  it('should reject missing firstName', () => {
    const result = createUserSchema.safeParse({ ...validData, firstName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject missing lastName', () => {
    const result = createUserSchema.safeParse({ ...validData, lastName: '' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = createUserSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('should reject password shorter than 8 chars', () => {
    const result = createUserSchema.safeParse({ ...validData, password: 'short' });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const result = createUserSchema.safeParse({ ...validData, role: 'superuser' });
    expect(result.success).toBe(false);
  });

  it('should default role to student when not provided', () => {
    const { role: _role, ...withoutRole } = validData;
    const result = createUserSchema.safeParse(withoutRole);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe('student');
    }
  });
});
