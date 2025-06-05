import { readDB, writeDB } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
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

  const siteName = site.replace(/^https?:\/\//i, '');

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  // ⚠️ Verificar si ya existe una entrada con el mismo site y siteUsername
  const alreadyExists = user.passwords.some(
    (entry) =>
      entry.site === site &&
      entry.siteUsername === siteUsername
  );

  if (alreadyExists) {
    return res.status(409).json({ error: 'La contraseña para este sitio y usuario ya existe' });
  }

  const { encrypted, iv } = encrypt(password);

  const newPasswordEntry = {
    id: uuidv4(),
    site,
    siteName,
    siteUsername,
    encrypted,
    iv,
    favorito: false
  };

  user.passwords.push(newPasswordEntry);
  writeDB(db);
  res.json({ message: 'Contraseña guardada' });
}




export function getPasswords(req, res) {
  const { username } = req.user;
  const db = readDB();
  const user = db.users.find(u => u.username === username);

  res.json(
    user.passwords.map(p => ({
      id: p.id,
      siteName: p.siteName,
      favorito: p.favorito
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
  const { siteName } = req.params;


  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const entry = user.passwords.find(p => p.siteName === siteName);
  if (!entry) return res.status(404).json({ error: 'Contraseña no encontrada para este sitio' });

  const decrypted = decrypt(entry.encrypted, entry.iv);

  return res.json({
    username: entry.siteUsername,
    site: entry.site,
    password: decrypted,
  });
}


export function markAsFavorite(req, res) {
  const { username } = req.user;
  const { id } = req.params;

  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const entry = user.passwords.find(p => p.id === id);
  if (!entry) return res.status(404).json({ error: 'Contraseña no encontrada' });

  entry.favorito = true;
  writeDB(db);

  res.json({ message: 'Contraseña marcada como favorita' });
}

