import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);
const algorithm = 'scrypt';
const keyLength = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;

  return `${algorithm}:${salt}:${derivedKey.toString('base64')}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [storedAlgorithm, salt, hash] = storedHash.split(':');

  if (storedAlgorithm !== algorithm || !salt || !hash) {
    return false;
  }

  const storedKey = Buffer.from(hash, 'base64');
  const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer;

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}
