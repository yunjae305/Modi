import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);
const algorithm = 'scrypt';
const keyLength = 64;

export function normalizeCredentialEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const key = await scryptAsync(password, salt, keyLength) as Buffer;
  return `${algorithm}$${salt}$${key.toString('base64url')}`;
}

export async function verifyPasswordHash(password: string, hash: string) {
  const [kind, salt, saved] = hash.split('$');
  if (kind !== algorithm || !salt || !saved) {
    return false;
  }
  const actual = await scryptAsync(password, salt, keyLength) as Buffer;
  const expected = Buffer.from(saved, 'base64url');
  if (actual.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(actual, expected);
}
