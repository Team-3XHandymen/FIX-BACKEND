import { Router } from 'express';
import { createReview, getProviderReviews, getBookingReview } from '../controllers/reviewController';
import { auth } from '../middleware/auth';

const router = Router();

// Create a new review (requires authentication)
router.post('/', auth, createReview);

// Get all reviews for a specific provider (public)
router.get('/provider/:providerId', getProviderReviews);

// Get review for a specific booking (public)
router.get('/booking/:bookingId', getBookingReview);

export default router;

