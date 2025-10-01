import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { connectDB } from './config/database';
import { config } from './config/env';
import serviceRoutes from './routes/services.routes';
import bookingRoutes from './routes/bookings.routes';
import handymanRoutes from './routes/handyman.routes';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';
import chatRoutes from './routes/chat.routes';
import stripeRoutes from './routes/stripe.routes';
import { Chat } from './models/Chat';

const app: Express = express();
const server = createServer(app);

// CORS configuration - allow both local and production URLs
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL || '', // Your deployed frontend URL from environment variables
].filter(Boolean); // Remove empty strings

// Create Socket.io server
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/handyman', handymanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stripe', stripeRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join a specific booking room for chat
  socket.on('join_booking_room', (bookingId: string) => {
    socket.join(`booking_${bookingId}`);
    console.log(`📱 User ${socket.id} joined booking room: ${bookingId}`);
  });

  // Handle chat messages
  socket.on('send_message', async (data: {
    bookingId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
  }) => {
    try {
      // Save message to database first
      let chat = await Chat.findOne({ bookingId: data.bookingId });
      
      if (!chat) {
        chat = new Chat({
          bookingId: data.bookingId,
          messages: [],
        });
      }

      const newMessage = {
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        timestamp: new Date(),
      };

      chat.messages.push(newMessage);
      chat.lastMessageAt = new Date();
      await chat.save();
      
      console.log(`💾 Message saved to database for booking ${data.bookingId}`);
    } catch (error) {
      console.error('❌ Error saving message to database:', error);
    }

    // Broadcast message to all users in the booking room
    io.to(`booking_${data.bookingId}`).emit('receive_message', {
      ...data,
      timestamp: new Date(),
    });
    console.log(`💬 Message sent in booking ${data.bookingId}: ${data.message}`);
  });

  // Handle booking status updates
  socket.on('booking_status_update', (data: {
    bookingId: string;
    newStatus: string;
    userId: string;
  }) => {
    // Broadcast status update to all users in the booking room
    io.to(`booking_${data.bookingId}`).emit('booking_status_changed', {
      ...data,
      timestamp: new Date(),
    });
    console.log(`🔄 Booking ${data.bookingId} status updated to: ${data.newStatus}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Debug: Log all registered routes
console.log('🔗 Registered API routes:');
console.log('  - /api/services');
console.log('  - /api/bookings');
console.log('  - /api/handyman');
console.log('  - /api/auth');
console.log('  - /api/clients');
console.log('  - /api/chat');
console.log('  - /api/stripe');

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Handyman App API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

server.listen(config.PORT, () => {
  console.log(`🚀 Server is running on port ${config.PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${config.CORS_ORIGIN || 'Not configured'}`);
  console.log(`🔌 WebSocket server is ready`);
}); 