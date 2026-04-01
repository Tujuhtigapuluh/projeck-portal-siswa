import { Router } from 'express';

export const healthRoute = Router();

healthRoute.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Backend absensi aktif',
    timestamp: new Date().toISOString(),
  });
});
