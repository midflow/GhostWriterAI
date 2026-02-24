import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../config/firebase.js';
import { AppError } from '../types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
}

/**
 * Middleware to verify JWT token
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Missing or invalid authorization header', 'NO_AUTH_HEADER');
    }

    const token = authHeader.substring(7);

    // Try to verify Firebase token first
    try {
      const decodedToken = await verifyFirebaseToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
      return;
    } catch (firebaseError) {
      // If Firebase verification fails, try JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
          uid: string;
          email?: string;
        };
        req.user = decoded;
        next();
        return;
      } catch (jwtError) {
        throw new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
      }
    }
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          statusCode: 401,
        },
      });
    }
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decodedToken = await verifyFirebaseToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
        };
      } catch (error) {
        // Silently fail - user is optional
      }
    }

    next();
  } catch (error) {
    next();
  }
}
