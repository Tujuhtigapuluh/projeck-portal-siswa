import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Absensi Sekolah API',
    version: '0.1.0',
  });
});

app.use('/api', apiRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

app.listen(env.PORT, () => {
  console.log(`Backend berjalan di http://localhost:${env.PORT}`);
});
