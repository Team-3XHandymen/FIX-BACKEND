import { Router } from 'express';

const router = Router();

// Placeholder for user registration
router.post('/register', (req, res) => {
  res.status(201).json({ message: 'User registered successfully' });
});

// Placeholder for user login
router.post('/login', (req, res) => {
  res.status(200).json({ message: 'User logged in successfully' });
});

export default router; 