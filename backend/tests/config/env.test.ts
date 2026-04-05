import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5007),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CSRF_SECRET: z.string().min(32),
  RESEND_API_KEY: z.string().default(''),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JAVA_INTERNAL_SECRET: z.string().min(32),
});

describe('env schema', () => {
  it('should reject when DATABASE_URL is missing', () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject when JWT_ACCESS_SECRET is too short', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost/test',
      JWT_ACCESS_SECRET: 'short',
      JWT_REFRESH_SECRET: 'a'.repeat(32),
      CSRF_SECRET: 'a'.repeat(32),
      JAVA_INTERNAL_SECRET: 'a'.repeat(32),
    });
    expect(result.success).toBe(false);
  });

  it('should apply defaults for optional fields', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://localhost/test',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      CSRF_SECRET: 'c'.repeat(32),
      JAVA_INTERNAL_SECRET: 'd'.repeat(32),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(5007);
      expect(result.data.NODE_ENV).toBe('development');
      expect(result.data.JWT_ACCESS_EXPIRES_IN).toBe('15m');
    }
  });

  it('should parse a valid complete env', () => {
    const result = envSchema.safeParse({
      NODE_ENV: 'production',
      PORT: '8080',
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_ACCESS_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      JWT_ACCESS_EXPIRES_IN: '30m',
      JWT_REFRESH_EXPIRES_IN: '14d',
      CSRF_SECRET: 'c'.repeat(32),
      RESEND_API_KEY: 're_test_key',
      FRONTEND_URL: 'https://myschool.com',
      JAVA_INTERNAL_SECRET: 'd'.repeat(32),
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.PORT).toBe(8080);
      expect(result.data.NODE_ENV).toBe('production');
    }
  });
});
