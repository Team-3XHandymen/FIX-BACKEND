import express from 'express';
import { AdminController } from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Get dashboard statistics
router.get('/dashboard/stats', AdminController.getDashboardStats);

// Get bookings by location
router.get('/bookings/location', AdminController.getBookingsByLocation);

export default router;

