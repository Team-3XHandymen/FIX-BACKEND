import express from 'express';
import {
  registerHandyman,
  getHandymanProfile,
  getHandymanProfileByUserId,
  updateHandymanProfile,
  getAllHandymen,
  getServiceProvidersByServiceId,
  getAvailableServices
} from '../controllers/handymanController';
import { auth, requireProvider } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', registerHandyman);
router.get('/services', getAvailableServices); // New route for available services
router.get('/profile/:userId', getHandymanProfileByUserId); // Route to check if user is handyman

// Protected routes (require authentication)
router.get('/profile', auth, getHandymanProfile);
router.put('/profile', auth, updateHandymanProfile);

// Admin routes (for managing handymen)
router.get('/all', auth, requireProvider, getAllHandymen);

// Public route to get service providers by service ID
router.get('/service/:serviceId', getServiceProvidersByServiceId);

export default router; 