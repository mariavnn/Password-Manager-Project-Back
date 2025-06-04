import { readDB, writeDB } from '../config/db';
import { encrypt, decrypt, comparePassword } from '../utils/cryptoUtils';

export function savePassword(req, res) {
  const { username } = req.user;
  const { site, password } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  const { encrypted, iv } = encrypt(password);

  user.passwords.push({ site, encrypted, iv });
  writeDB(db);
  res.json({ message: 'Contraseña guardada' });
}

export function getPasswords(req, res) {
  const { username } = req.user;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  res.json(user.passwords.map(p => ({ site: p.site })));
}

export async function validateAccessKey(req, res) {
  const { username } = req.user;
  const { accessKey } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  const valid = await comparePassword(accessKey, user.password);
  res.json({ valid });
}

export function getPassword(req, res) {
  const { username } = req.user;
  const { site } = req.params;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  const entry = user.passwords.find(p => p.site === site);
  if (!entry) return res.status(404).json({ error: 'No encontrada' });

  const decrypted = decrypt(entry.encrypted, entry.iv);
  res.json({ password: decrypted });
}
