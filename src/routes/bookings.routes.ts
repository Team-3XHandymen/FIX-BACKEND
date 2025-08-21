import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBooking,
  getPendingBookings,
  getBookingsByProviderId,
  getBookingsByClerkUserId,
  getBookingsByProviderDatabaseId,
  updateBookingStatusPublic
} from '../controllers/bookingController';
import { auth, requireClient, requireProvider } from '../middleware/auth';

const router = express.Router();

// Public route to get bookings by provider ID (for handyman dashboard)
// This route is public and doesn't require authentication
router.get('/provider/:providerId', getBookingsByProviderId);

// Public route to get bookings by Clerk userId (for handyman dashboard)
// This route is public and doesn't require authentication
router.get('/provider-clerk/:clerkUserId', getBookingsByClerkUserId);

// Public route to get bookings by provider database ID directly
// This route is public and doesn't require authentication
router.get('/provider-db/:providerDatabaseId', getBookingsByProviderDatabaseId);

// Public route to update booking status (for handyman dashboard)
// This route is public and doesn't require authentication
router.patch('/:id/status-public', updateBookingStatusPublic);

// All other booking routes require authentication
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