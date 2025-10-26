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
        lastReadByClient: chat.lastReadByClient,
        lastReadByProvider: chat.lastReadByProvider,
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

    console.log('📥 getUserChats called with:', { userId, userType });

    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'User ID and user type are required',
      });
    }

    // Import Booking model to join with chats
    const { Booking } = await import('../models/Booking');
    
    // Get all bookings for this user
    let bookings;
    if (userType === 'client') {
      bookings = await Booking.find({ clientId: userId });
      console.log(`📥 Found ${bookings.length} bookings for client ${userId}`);
    } else if (userType === 'handyman') {
      bookings = await Booking.find({ providerId: userId });
      console.log(`📥 Found ${bookings.length} bookings for handyman ${userId}`);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "client" or "handyman"',
      });
    }

    // Get booking IDs
    const bookingIds = bookings.map(booking => booking._id?.toString() || '');

    // Get chats for these bookings
    const chats = await Chat.find({ 
      bookingId: { $in: bookingIds } 
    }).sort({ lastMessageAt: -1 });

    console.log(`📥 Found ${chats.length} chats for ${bookingIds.length} bookings`);

    // Enrich chats with booking information
    const enrichedChats = chats.map(chat => {
      const booking = bookings.find(b => b._id?.toString() === chat.bookingId);
      const lastMessage = chat.messages[chat.messages.length - 1];
      
      // Calculate unread count based on last read time
      const lastReadTime = userType === 'client' 
        ? chat.lastReadByClient 
        : chat.lastReadByProvider;
      
      const unreadCount = lastReadTime 
        ? chat.messages.filter(msg => 
            msg.senderId !== userId && 
            new Date(msg.timestamp) > new Date(lastReadTime)
          ).length
        : chat.messages.filter(msg => msg.senderId !== userId).length;
      
      return {
        bookingId: chat.bookingId,
        lastMessage: lastMessage ? {
          senderName: lastMessage.senderName,
          message: lastMessage.message,
          timestamp: lastMessage.timestamp,
        } : null,
        lastMessageAt: chat.lastMessageAt,
        unreadCount,
        booking: booking ? {
          serviceName: booking.serviceName,
          providerName: booking.providerName,
          status: booking.status,
          scheduledTime: booking.scheduledTime,
        } : null,
      };
    });

    res.json({
      success: true,
      message: 'User chats retrieved successfully',
      data: enrichedChats,
    });

    console.log(`📥 Returning ${enrichedChats.length} enriched chats`);
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user chats',
    });
  }
};

// Mark messages as read for a specific user (client or provider)
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { userId, userType } = req.body;

    console.log('📖 markMessagesAsRead called for:', { bookingId, userId, userType });

    if (!bookingId || !userId || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Booking ID, user ID, and user type are required',
      });
    }

    if (!['client', 'provider'].includes(userType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user type. Must be either "client" or "provider"',
      });
    }

    const updateField = userType === 'client' 
      ? { lastReadByClient: new Date() }
      : { lastReadByProvider: new Date() };

    const chat = await Chat.findOneAndUpdate(
      { bookingId },
      updateField,
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    console.log('📖 Messages marked as read for:', userType);

    res.json({
      success: true,
      message: 'Messages marked as read successfully',
      data: {
        lastReadByClient: chat.lastReadByClient,
        lastReadByProvider: chat.lastReadByProvider,
      },
    });
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
    });
  }
};
