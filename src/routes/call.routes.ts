import { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  getAccessToken,
  getContactNumber,
  initiateCall,
  updateCallStatus,
  getCallHistory,
} from '../controllers/callController';
import {
  handleOutboundCall,
  handleCallStatus,
} from '../controllers/twilioWebhookController';

const router = Router();

// Diagnostic route (no auth needed, for debugging)
router.get('/diagnostics', (req, res) => {
  const { config } = require('../config/env');
  res.json({
    success: true,
    data: {
      hasAccountSid: !!config.TWILIO_ACCOUNT_SID,
      accountSidPreview: config.TWILIO_ACCOUNT_SID ? config.TWILIO_ACCOUNT_SID.substring(0, 12) + '...' : 'MISSING',
      hasAuthToken: !!config.TWILIO_AUTH_TOKEN,
      hasApiKeySid: !!config.TWILIO_API_KEY_SID,
      apiKeySidPreview: config.TWILIO_API_KEY_SID ? config.TWILIO_API_KEY_SID.substring(0, 12) + '...' : 'MISSING',
      hasApiKeySecret: !!config.TWILIO_API_KEY_SECRET,
      apiKeySecretLength: config.TWILIO_API_KEY_SECRET ? config.TWILIO_API_KEY_SECRET.length : 0,
      enableCalling: config.ENABLE_CALLING,
    },
  });
});

// Protected routes (require authentication)
router.get('/token', auth, getAccessToken);
router.get('/contact/:bookingId', auth, getContactNumber);
router.post('/initiate', auth, initiateCall);
router.get('/history/:bookingId', auth, getCallHistory);

// Webhook routes (no auth, Twilio will call these)
// Note: In production, verify Twilio signatures for security
router.post('/webhook/outbound', handleOutboundCall);
router.post('/webhook/status', handleCallStatus);
router.post('/status', updateCallStatus); // Alternative status endpoint

export default router;

