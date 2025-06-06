import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { conn } from '../config/supabaseClient.js';
import { hashPassword, comparePassword } from '../utils/cryptoUtils.js';

dotenv.config();
const SECRET = process.env.SECRET_KEY;

export async function register(req, res) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Verificar usuario o email existente
  const { data: existingUser, error: userError } = await conn
    .from('users')
    .select()
    .or(`username.eq.${username},email.eq.${email}`);

  if (userError) {
    console.error('Error consultando Supabase:', userError);
    return res.status(500).json({ error: 'Error consultando Supabase' });
  }

  if (existingUser.length > 0) {
    const existing = existingUser[0];
    if (existing.username === username) return res.status(400).json({ error: 'Usuario ya existe' });
    if (existing.email === email) return res.status(400).json({ error: 'Email ya registrado' });
  }

  const hashed = await hashPassword(password);

  const { error: insertError } = await conn
    .from('users')
    .insert([{ username, email, password: hashed }]);

  if (insertError) {
    console.error('Error al insertar usuario:', insertError);
    return res.status(500).json({ error: insertError.message || 'Error al registrar usuario' });
  }

  return res.json({ message: 'Registrado exitosamente' });
}


export async function login(req, res) {
  const { username, password } = req.body;

  const { data: user, error } = await conn
    .from('users')
    .select()
    .eq('username', username)
    .single();

  if (error || !user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

  res.json({ token });
}
