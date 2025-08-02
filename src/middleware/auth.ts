import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      userId?: string; // Clerk user ID
      userType?: 'client' | 'provider';
    }
  }
}

// Middleware to extract Clerk user ID from headers
export const auth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // In a real implementation, you would verify the Clerk session/token here
    // For now, we'll expect the user ID to be passed in headers
    const userId = req.header('X-User-ID');
    const userType = req.header('X-User-Type') as 'client' | 'provider';

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User ID not provided.',
      });
      return;
    }

    if (!userType || !['client', 'provider'].includes(userType)) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid user type.',
      });
      return;
    }

    req.userId = userId;
    req.userType = userType;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
    return;
  }
};

// Middleware to authorize specific user types
export const authorize = (...userTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
      return;
    }

    if (!req.userType || !userTypes.includes(req.userType)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

// Middleware to ensure user is a client
export const requireClient = authorize('client');

// Middleware to ensure user is a provider
export const requireProvider = authorize('provider'); 