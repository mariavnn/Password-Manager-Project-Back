import jwt from 'jsonwebtoken';
import { readDB, writeDB } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/cryptoUtils.js';

const SECRET = 'supersecreto';

export async function register(req, res) {
  const { email, username, password } = req.body;

  const db = readDB();

  const existsUser = db.users.find(u => u.username === username);
  const existsEmail = db.users.find(u => u.email === email);

  if (existsUser) return res.status(400).json({ error: 'Usuario ya existe' });
  if (existsEmail) return res.status(400).json({ error: 'Email ya registrado' });

  const hashed = await hashPassword(password);

  db.users.push({ username: username, email, email, password: hashed, passwords: [] });

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

  const token = jwt.sign({ username }, SECRET);
  res.json({ token });
}
