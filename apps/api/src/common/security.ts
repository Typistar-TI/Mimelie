import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const randomToken = () => randomBytes(32).toString('base64url');
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
export const hashIp = (ip: string | undefined) => ip ? createHash('sha256').update(`${process.env.SESSION_SECRET}:${ip}`).digest('hex') : undefined;

const encryptionKey = () => createHash('sha256').update(process.env.TOKEN_ENCRYPTION_KEY ?? process.env.SESSION_SECRET ?? 'development-only').digest();
export function encryptSecret(value: string): string {
  const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
}
export function decryptSecret(value: string): string {
  const [ivText, tagText, encryptedText] = value.split('.');
  if (!ivText || !tagText || !encryptedText) throw new Error('INVALID_SECRET');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64url')), decipher.final()]).toString('utf8');
}
