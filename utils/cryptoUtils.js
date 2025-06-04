import crypto from 'crypto';
import bcrypt from 'bcrypt';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = crypto.randomBytes(32);
const IV = crypto.randomBytes(16);

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashed) {
  return await bcrypt.compare(password, hashed);
}

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(String('clave-secreta')).digest('base64').substring(0, 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { encrypted, iv: iv.toString('hex') };
}

export function decrypt(encrypted, iv) {
  const key = crypto.createHash('sha256').update(String('clave-secreta')).digest('base64').substring(0, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
