"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessagesAsRead = exports.getUserChats = exports.sendMessage = exports.getChatMessages = void 0;
const Chat_1 = require("../models/Chat");
const getChatMessages = async (req, res) => {
    try {
        const { bookingId } = req.params;
        console.log('📥 getChatMessages called for booking:', bookingId);
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID is required',
            });
        }
        let chat = await Chat_1.Chat.findOne({ bookingId });
        if (!chat) {
            console.log('📥 No chat found, creating new one for booking:', bookingId);
            chat = new Chat_1.Chat({
                bookingId,
                messages: [],
            });
            await chat.save();
        }
        else {
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
    }
    catch (error) {
        console.error('❌ Error getting chat messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve chat messages',
        });
    }
};
exports.getChatMessages = getChatMessages;
const sendMessage = async (req, res) => {
    try {
        const { bookingId, senderId, senderName, message } = req.body;
        console.log('📝 API sendMessage called with:', { bookingId, senderId, senderName, message });
        if (!bookingId || !senderId || !senderName || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: bookingId, senderId, senderName, message',
            });
        }
        let chat = await Chat_1.Chat.findOne({ bookingId });
        if (!chat) {
            console.log('📝 Creating new chat for booking:', bookingId);
            chat = new Chat_1.Chat({
                bookingId,
                messages: [],
            });
        }
        else {
            console.log('📝 Found existing chat with', chat.messages.length, 'messages');
        }
        const newMessage = {
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
    }
    catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
        });
    }
};
exports.sendMessage = sendMessage;
const getUserChats = async (req, res) => {
    try {
        const { userId, userType } = req.query;
        console.log('📥 getUserChats called with:', { userId, userType });
        if (!userId || !userType) {
            return res.status(400).json({
                success: false,
                message: 'User ID and user type are required',
            });
        }
        const { Booking } = await Promise.resolve().then(() => __importStar(require('../models/Booking')));
        let bookings;
        if (userType === 'client') {
            bookings = await Booking.find({ clientId: userId });
            console.log(`📥 Found ${bookings.length} bookings for client ${userId}`);
        }
        else if (userType === 'handyman') {
            bookings = await Booking.find({ providerId: userId });
            console.log(`📥 Found ${bookings.length} bookings for handyman ${userId}`);
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type. Must be either "client" or "handyman"',
            });
        }
        const bookingIds = bookings.map(booking => { var _a; return ((_a = booking._id) === null || _a === void 0 ? void 0 : _a.toString()) || ''; });
        const chats = await Chat_1.Chat.find({
            bookingId: { $in: bookingIds }
        }).sort({ lastMessageAt: -1 });
        console.log(`📥 Found ${chats.length} chats for ${bookingIds.length} bookings`);
        const enrichedChats = chats.map(chat => {
            const booking = bookings.find(b => { var _a; return ((_a = b._id) === null || _a === void 0 ? void 0 : _a.toString()) === chat.bookingId; });
            const lastMessage = chat.messages[chat.messages.length - 1];
            const lastReadTime = userType === 'client'
                ? chat.lastReadByClient
                : chat.lastReadByProvider;
            const unreadCount = lastReadTime
                ? chat.messages.filter(msg => msg.senderId !== userId &&
                    new Date(msg.timestamp) > new Date(lastReadTime)).length
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
    }
    catch (error) {
        console.error('Error getting user chats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user chats',
        });
    }
};
exports.getUserChats = getUserChats;
const markMessagesAsRead = async (req, res) => {
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
        const chat = await Chat_1.Chat.findOneAndUpdate({ bookingId }, updateField, { new: true });
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
    }
    catch (error) {
        console.error('❌ Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read',
        });
    }
};
exports.markMessagesAsRead = markMessagesAsRead;
//# sourceMappingURL=chatController.js.map