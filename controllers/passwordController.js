import { v4 as uuidv4 } from 'uuid';
import { encrypt, decrypt, comparePassword } from '../utils/cryptoUtils.js';
import { conn } from '../config/supabaseClient.js';

export async function savePassword(req, res) {
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

  const { data: user, error: userError } = await conn
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { data: existingPassword, error: passError } = await conn
    .from('stored_passwords')
    .select('*')
    .eq('user_id', user.id)
    .eq('site', site)
    .eq('site_username', siteUsername)
    .single();

  if (existingPassword) {
    return res.status(409).json({ error: 'La contraseña para este sitio y usuario ya existe' });
  }

  const { encrypted, iv } = encrypt(password);

  const newPasswordEntry = {
    id: uuidv4(),
    user_id: user.id,
    site,
    site_name: siteName,
    site_username: siteUsername,
    encrypted,
    iv,
    favorito: false
  };

  const { error: insertError } = await conn
    .from('stored_passwords')
    .insert(newPasswordEntry);

  if (insertError) {
    return res.status(500).json({ error: 'Error guardando la contraseña' });
  }

  res.json({ message: 'Contraseña guardada' });
}


export async function getPasswords(req, res) {
  const { username } = req.user;

  const { data: user, error: userError } = await conn
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { data: passwords, error: passError } = await conn
    .from('stored_passwords')
    .select('id, site_name, favorito')
    .eq('user_id', user.id);

  if (passError) return res.status(500).json({ error: 'Error al obtener contraseñas' });

  res.json(passwords);
}


export async function validateAccessKey(req, res) {
  const { username } = req.user;
  const { accessKey } = req.body;


  const { data: user, error: userError } = await conn
    .from('users')
    .select('password')
    .eq('username', username)
    .single();

  if (userError || !user) return res.status(404).json({ valid: false });

  const valid = await comparePassword(accessKey, user.password);
  res.json({ valid });
}


export async function getPassword(req, res) {
  const { username } = req.user;
  const { siteName } = req.params;

  const { data: user, error: userError } = await conn
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { data: entry, error: entryError } = await conn
    .from('stored_passwords')
    .select('*')
    .eq('user_id', user.id)
    .eq('site_name', siteName)
    .single();

  if (entryError || !entry) return res.status(404).json({ error: 'Contraseña no encontrada para este sitio' });

  const decrypted = decrypt(entry.encrypted, entry.iv);

  return res.json({
    username: entry.site_username,
    site: entry.site,
    password: decrypted,
  });
}


export async function markAsFavorite(req, res) {
  const { username } = req.user;
  const { id } = req.params;

  const { data: user, error: userError } = await conn
    .from('users')
    .select('id')
    .eq('username', username)
    .single();

  if (userError || !user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { data: entry, error: entryError } = await conn
    .from('stored_passwords')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (entryError || !entry) return res.status(404).json({ error: 'Contraseña no encontrada' });

  const { error: updateError } = await conn
    .from('stored_passwords')
    .update({ favorito: true })
    .eq('id', id);

  if (updateError) return res.status(500).json({ error: 'Error actualizando favorito' });

  res.json({ message: 'Contraseña marcada como favorita' });
}
