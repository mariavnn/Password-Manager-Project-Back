import { verify } from 'jsonwebtoken';
const SECRET = 'supersecreto';

export default (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(403).json({ error: 'Token inválido' });
  }
};
