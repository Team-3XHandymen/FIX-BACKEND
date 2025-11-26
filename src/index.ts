import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import { config } from './config/env';
import serviceRoutes from './routes/services.routes';
import bookingRoutes from './routes/bookings.routes';
import handymanRoutes from './routes/handyman.routes';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/clients.routes';

const app: Express = express();
const server = http.createServer(app);

// Configure allowed origins for CORS
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fix-frontend.netlify.app',
  config.CORS_ORIGIN,
  config.FRONTEND_URL,
].filter(Boolean) as string[];

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
connectDB();

// CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Type'],
}));

// Handle preflight requests
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'X-User-Type'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/handyman', handymanRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('join_booking_room', (bookingId: string) => {
    socket.join(`booking_${bookingId}`);
    console.log(`📱 User ${socket.id} joined booking room: ${bookingId}`);
  });

  socket.on('booking_status_update', (data: { bookingId: string; newStatus: string; userId: string }) => {
    io.to(`booking_${data.bookingId}`).emit('booking_status_changed', {
      ...data,
      timestamp: new Date(),
    });
    console.log(`🔄 Booking ${data.bookingId} status updated to: ${data.newStatus}`);
  });

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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    cors_origins: allowedOrigins,
  });
});

// API health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    cors_origins: allowedOrigins,
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
  console.log(`🌐 CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`🔌 Socket.io enabled`);
});
