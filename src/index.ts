import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { config } from './config/env';
import serviceRoutes from './routes/services.routes';
import bookingRoutes from './routes/bookings.routes';
import handymanRoutes from './routes/handyman.routes';
import clientRoutes from './routes/clients.routes';

const app: Express = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN ? [config.CORS_ORIGIN] : false,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/handyman', handymanRoutes);
app.use('/api/clients', clientRoutes);

// Debug: Log all registered routes
console.log('🔗 Registered API routes:');
console.log('  - /api/services');
console.log('  - /api/bookings');
console.log('  - /api/handyman');
console.log('  - /api/clients');

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

app.listen(config.PORT, () => {
  console.log(`🚀 Server is running on port ${config.PORT}`);
  console.log(`📊 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 CORS Origin: ${config.CORS_ORIGIN || 'Not configured'}`);
}); 