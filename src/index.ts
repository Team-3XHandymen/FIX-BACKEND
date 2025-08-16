import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { config } from './config/env';
import serviceRoutes from './routes/services.routes';
import bookingRoutes from './routes/bookings.routes';
import handymanRoutes from './routes/handyman.routes';
import authRoutes from './routes/auth.routes';

const app: Express = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN ? [config.CORS_ORIGIN] : false,
  credentials: true,
}));

// Content Security Policy middleware
// app.use((req, res, next) => {
//   res.setHeader(
//     'Content-Security-Policy',
//     [
//       "default-src 'self'",
//       "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
//       "style-src 'self' 'unsafe-inline' https:",
//       "font-src 'self' https: data:",
//       "img-src 'self' data: https: blob:",
//       "connect-src 'self' https: wss:",
//       "frame-src 'self' https:",
//       "object-src 'none'",
//       "base-uri 'self'",
//       "form-action 'self'",
//       "upgrade-insecure-requests"
//     ].join('; ')
//   );
//   next();
// });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/handyman', handymanRoutes);

app.use('/api/auth', authRoutes);


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