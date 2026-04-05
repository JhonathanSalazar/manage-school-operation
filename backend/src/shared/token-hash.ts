import crypto from 'crypto';

export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export function compareToken(raw: string, hash: string): boolean {
  const rawHash = hashToken(raw);
  return crypto.timingSafeEqual(Buffer.from(rawHash), Buffer.from(hash));
}
