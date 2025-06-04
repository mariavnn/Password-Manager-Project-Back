import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { hash, compare } from 'bcrypt';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = randomBytes(32);
const IV = randomBytes(16);

function encrypt(text) {
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, IV);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: IV.toString('hex') };
}

function decrypt(encrypted, ivHex) {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export default {
  encrypt,
  decrypt,
  hashPassword: (plain) => hash(plain, 10),
  comparePassword: (plain, hashed) => compare(plain, hashed),
};
