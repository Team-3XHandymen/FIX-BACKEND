import { Request, Response } from 'express';
import { Chat, IChatMessage } from '../models/Chat';

// Get chat messages for a specific booking
export const getChatMessages = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    console.log('📥 getChatMessages called for booking:', bookingId);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID is required',
      });
    }

    let chat = await Chat.findOne({ bookingId });

    if (!chat) {
      console.log('📥 No chat found, creating new one for booking:', bookingId);
      // Create a new chat if it doesn't exist
      chat = new Chat({
        bookingId,
        messages: [],
      });
      await chat.save();
    } else {
      console.log('📥 Found existing chat with', chat.messages.length, 'messages');
    }

    const response = {
      success: true,
      message: 'Chat messages retrieved successfully',
      data: {
        bookingId: chat.bookingId,
        messages: chat.messages,
        lastMessageAt: chat.lastMessageAt,
      },
    };

    console.log('📥 Returning chat data:', response);

    res.json(response);
  } catch (error) {
    console.error('❌ Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat messages',
    });
  }
};

// Send a message (this will be called via WebSocket, but we keep it for persistence)
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { bookingId, senderId, senderName, message } = req.body;

    console.log('📝 API sendMessage called with:', { bookingId, senderId, senderName, message });

    if (!bookingId || !senderId || !senderName || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: bookingId, senderId, senderName, message',
      });
    }

    let chat = await Chat.findOne({ bookingId });

    if (!chat) {
      console.log('📝 Creating new chat for booking:', bookingId);
      chat = new Chat({
        bookingId,
        messages: [],
      });
    } else {
      console.log('📝 Found existing chat with', chat.messages.length, 'messages');
    }

    const newMessage: IChatMessage = {
      senderId,
      senderName,
      message,
      timestamp: new Date(),
    };

    chat.messages.push(newMessage);
    chat.lastMessageAt = new Date();
    await chat.save();

    console.log('📝 Message saved successfully. Total messages in chat:', chat.messages.length);

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage,
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Get all chats for a user (either as client or handyman)
export const getUserChats = async (req: Request, res: Response) => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and user type are required',
      });
    }

    // This would need to be implemented based on your booking structure
    // For now, we'll return an empty array
    // You can enhance this by joining with bookings to get relevant chats

    res.json({
      success: true,
      message: 'User chats retrieved successfully',
      data: [],
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user chats',
    });
  }
};
