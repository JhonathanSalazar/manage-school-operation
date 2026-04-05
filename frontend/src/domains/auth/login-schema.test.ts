import { loginSchema } from './login-schema';

describe('loginSchema', () => {
  it('should pass with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });

  it('should reject an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it('should reject empty fields', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });
    expect(result.success).toBe(false);
  });
});
