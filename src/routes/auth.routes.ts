import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { WebhookController } from '../controllers/webhookController';

const router = Router();

// Create new user in database after Clerk authentication
router.post('/create-user', AuthController.createUser);

// Get user profile by Clerk user ID and type
router.get('/profile/:clerkUserId/:userType', AuthController.getUserProfile);

// Update user profile
router.put('/profile/:clerkUserId/:userType', AuthController.updateUserProfile);

// Delete user account
router.delete('/profile/:clerkUserId/:userType', AuthController.deleteUser);

// Clerk webhook endpoint
router.post('/webhook', WebhookController.handleClerkWebhook);

export default router;
