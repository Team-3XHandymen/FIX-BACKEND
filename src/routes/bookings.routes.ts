import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  getPendingBookings
} from '../controllers/bookingController';
import { auth, requireClient, requireProvider } from '../middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// Client routes
router.post('/', requireClient, createBooking);
router.get('/my', getMyBookings);

// Provider routes
router.get('/pending', requireProvider, getPendingBookings);

// Dynamic routes (must come after specific routes)
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);

export default router; 