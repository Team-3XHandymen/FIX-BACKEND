import express from 'express';
import { GoogleCalendarController } from '../controllers/googleCalendarController';
import { auth, requireProvider } from '../middleware/auth';

const router = express.Router();

// Get OAuth authorization URL (requires authentication)
router.get('/auth-url', auth, requireProvider, GoogleCalendarController.getAuthUrl);

// OAuth callback (public route, no auth required)
router.get('/callback', GoogleCalendarController.handleCallback);

// Get connection status (requires authentication)
router.get('/status', auth, requireProvider, GoogleCalendarController.getConnectionStatus);

// Disconnect Google Calendar (requires authentication)
router.delete('/disconnect', auth, requireProvider, GoogleCalendarController.disconnect);

export default router;

