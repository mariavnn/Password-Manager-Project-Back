import { readDB, writeDB } from '../config/db.js';
import { encrypt, decrypt, comparePassword } from '../utils/cryptoUtils.js';

export function savePassword(req, res) {
  const { username } = req.user;
  const { site, siteUsername, password } = req.body;

  if (!site || !siteUsername || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos (site, siteUsername o password)' });
  }

  const urlRegex = /^https?:\/\/.+/i;
  if (!urlRegex.test(site)) {
    return res.status(400).json({ error: 'El sitio debe ser una URL válida que empiece con http:// o https://' });
  }

  const siteName = site.replace(/^https?:\/\//i, '').replace(/^www\./i, '');

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  const { encrypted, iv } = encrypt(password);

  user.passwords.push({ site, siteName, siteUsername, encrypted, iv });
  writeDB(db);
  res.json({ message: 'Contraseña guardada' });
}



export function getPasswords(req, res) {
  const { username } = req.user;
  const db = readDB();
  const user = db.users.find(u => u.username === username);

  res.json(
    user.passwords.map(p => ({
      siteName: p.siteName
    }))
  );
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
