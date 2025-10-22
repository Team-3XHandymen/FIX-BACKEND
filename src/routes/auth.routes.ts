import express from 'express';
import { verifyUserRole } from '../controllers/authController';

const router = express.Router();

// Verify user role from database
router.get('/verify-role/:userId', verifyUserRole);

export default router;
