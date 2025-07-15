import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

// Protect routes
const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    if (!req.user.isActive) {
      res.status(401).json({
        success: false,
        error: 'User account is deactivated'
      });
      return;
    }

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
    return;
  }
};

// Grant access to specific roles
const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
      return;
    }
    next();
  };
};

// Check specific permissions
const checkPermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({
        success: false,
        error: `Permission ${permission} is required to access this route`
      });
      return;
    }
    next();
  };
};

export {
  protect,
  protect as auth, // Alias for backward compatibility
  authorize,
  checkPermission
};

export type { AuthenticatedRequest }; 