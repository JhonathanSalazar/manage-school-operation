import { hashPassword, verifyPassword } from '@shared/password';

describe('password utilities', () => {
  it('should hash a password and verify it correctly', async () => {
    const plain = 'MySecurePassword123!';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    await expect(verifyPassword(plain, hash)).resolves.toBe(true);
  });

  it('should produce different hashes for the same password', async () => {
    const plain = 'SamePassword';
    const hash1 = await hashPassword(plain);
    const hash2 = await hashPassword(plain);

    expect(hash1).not.toBe(hash2);
  });

  it('should return false for incorrect password', async () => {
    const hash = await hashPassword('correct_password');
    await expect(verifyPassword('wrong_password', hash)).resolves.toBe(false);
  });
});
