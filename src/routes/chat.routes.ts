import express from 'express';
import {
  getChatMessages,
  sendMessage,
  getUserChats,
  markMessagesAsRead,
} from '../controllers/chatController';

const router = express.Router();

// Get chat messages for a specific booking
router.get('/:bookingId/messages', getChatMessages);

// Send a message
router.post('/send', sendMessage);

// Get all chats for a user
router.get('/user', getUserChats);

// Mark messages as read
router.post('/:bookingId/mark-read', markMessagesAsRead);

export default router;
