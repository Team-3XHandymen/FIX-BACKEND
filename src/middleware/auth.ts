import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // Clerk user ID
        type?: 'client' | 'provider';
      };
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

    console.log('Auth middleware - Headers:', {
      'X-User-ID': userId,
      'X-User-Type': userType,
      'Content-Type': req.header('Content-Type'),
      'Origin': req.header('Origin')
    });

    if (!userId) {
      console.log('Auth middleware - No user ID provided');
      res.status(401).json({
        success: false,
        message: 'Access denied. User ID not provided.',
      });
      return;
    }

    if (!userType || !['client', 'provider'].includes(userType)) {
      console.log('Auth middleware - Invalid user type:', userType);
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid user type.',
      });
      return;
    }

    req.user = {
      id: userId,
      type: userType,
    };
    console.log('Auth middleware - User authenticated:', req.user);
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
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User not authenticated.',
      });
      return;
    }

    if (!req.user.type || !userTypes.includes(req.user.type)) {
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

// Middleware to check if user is admin (checks X-Admin header)
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.header('X-User-ID');
    const isAdmin = req.header('X-Admin') === 'true';

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Access denied. User ID not provided.',
      });
      return;
    }

    if (!isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
      return;
    }

    req.user = {
      id: userId,
      type: 'admin' as any, // Admin is a special type
    };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
    return;
  }
}; 