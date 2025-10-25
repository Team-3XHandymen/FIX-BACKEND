import express from 'express';
import { StripeController } from '../controllers/stripeController';
import { StripeWebhookController } from '../controllers/stripeWebhookController';
import { auth, requireProvider } from '../middleware/auth';

const router = express.Router();

// Webhook route (must be before other middleware)
// This route needs raw body parsing for webhook signature verification
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  StripeWebhookController.handleWebhook
);

// All other routes require authentication
router.use(auth);

// Provider account management routes
router.post('/create-provider-account', StripeController.createProviderAccount);
router.get('/provider-account/:userId', StripeController.getProviderAccountStatus);

// Payment routes
router.post('/create-checkout-session', StripeController.createCheckoutSession);
router.get('/payment/booking/:bookingId', StripeController.getPaymentByBookingId);
router.post('/create-manual-payment', StripeController.createManualPayment);
router.post('/refund/:paymentId', requireProvider, StripeController.createRefund);

export default router;
