import express from 'express';
import {
  registerHandyman,
  getHandymanProfile,
  updateHandymanProfile,
  getAllHandymen,
  getServiceProvidersByServiceId
} from '../controllers/handymanController';
import { auth, requireProvider } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/register', auth, registerHandyman);
router.get('/profile', auth, getHandymanProfile);
router.put('/profile', auth, updateHandymanProfile);

// Admin routes (for managing handymen)
router.get('/all', auth, requireProvider, getAllHandymen);

// Public route to get service providers by service ID
router.get('/service/:serviceId', getServiceProvidersByServiceId);

export default router; 