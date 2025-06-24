import { Router } from 'express';

const router = Router();

// Placeholder for getting available services
router.get('/', (req, res) => {
  res.status(200).json({ services: [] });
});

export default router; 