import { sign } from 'jsonwebtoken';
import { readDB, writeDB } from '../config/db';
import { hashPassword, comparePassword } from '../utils/cryptoUtils';

const SECRET = 'supersecreto';

export async function register(req, res) {
  const { username, password } = req.body;
  const db = readDB();
  const exists = db.users.find(u => u.username === username);
  if (exists) return res.status(400).json({ error: 'Usuario ya existe' });

  const hashed = await hashPassword(password);
  db.users.push({ username, password: hashed, passwords: [] });
  writeDB(db);
  res.json({ message: 'Registrado exitosamente' });
}

export async function login(req, res) {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await comparePassword(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = sign({ username }, SECRET);
  res.json({ token });
}
