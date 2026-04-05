import { noticeSchema } from './notice-schema';

describe('noticeSchema', () => {
  const validData = {
    title: 'Test Notice',
    content: 'Some content here',
    targetRoles: ['student'],
  };

  it('should pass with valid data', () => {
    expect(noticeSchema.safeParse(validData).success).toBe(true);
  });

  it('should reject empty title', () => {
    const result = noticeSchema.safeParse({ ...validData, title: '' });
    expect(result.success).toBe(false);
  });

  it('should reject empty content', () => {
    const result = noticeSchema.safeParse({ ...validData, content: '' });
    expect(result.success).toBe(false);
  });

  it('should reject empty targetRoles array', () => {
    const result = noticeSchema.safeParse({ ...validData, targetRoles: [] });
    expect(result.success).toBe(false);
  });

  it('should reject invalid role in targetRoles', () => {
    const result = noticeSchema.safeParse({ ...validData, targetRoles: ['superuser'] });
    expect(result.success).toBe(false);
  });

  it('should accept multiple valid target roles', () => {
    const result = noticeSchema.safeParse({ ...validData, targetRoles: ['student', 'teacher'] });
    expect(result.success).toBe(true);
  });
});
