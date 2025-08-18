import express from 'express';
import {
  createClient,
  getClientByUserId,
  updateClientProfile,
  getAllClients,
} from '../controllers/clientController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`📥 Client API Request: ${req.method} ${req.path}`);
  next();
});

// Create a new client (when they first log in)
router.post('/', createClient);

// Get all clients (admin only - can add auth middleware later)
router.get('/', getAllClients);

// Get client by userId (Clerk ID)
router.get('/:userId', getClientByUserId);

// Update client profile (for completing profile)
router.put('/:userId', updateClientProfile);

export default router;
