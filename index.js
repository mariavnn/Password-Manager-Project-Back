import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';

import authRoutes from './routes/authRoutes';
import passwordRoutes from './routes/passwordRoutes';

const app = express();
app.use(cors());
app.use(json());

app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
