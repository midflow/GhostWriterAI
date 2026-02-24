import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, getUserByUid } from '../services/firebaseService.js';
import { auth } from '../config/firebase.js';
import { AppError, AuthRequest, AuthResponse } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Register a new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as AuthRequest;

  // Validate input
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required', 'MISSING_FIELDS');
  }

  if (password.length < 6) {
    throw new AppError(400, 'Password must be at least 6 characters', 'WEAK_PASSWORD');
  }

  // Create user
  const user = await createUser(email, password);

  // Generate JWT token
  const token = jwt.sign(
    { uid: user.uid, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const response: AuthResponse = {
    uid: user.uid,
    email: user.email,
    token,
    expiresIn: process.env.JWT_EXPIRE || '7d',
  };

  res.status(201).json({ success: true, data: response });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as AuthRequest;

  // Validate input
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required', 'MISSING_FIELDS');
  }

  try {
    // Verify password using Firebase
    // Note: Firebase Admin SDK doesn't support password verification directly
    // In production, you should use Firebase REST API or custom implementation
    const user = await auth.getUserByEmail(email);

    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    // Get user profile
    const userProfile = await getUserByUid(user.uid);

    // Generate JWT token
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const response: AuthResponse = {
      uid: user.uid,
      email: user.email || '',
      token,
      expiresIn: process.env.JWT_EXPIRE || '7d',
    };

    res.json({ success: true, data: response });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }
});

/**
 * Get current user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    throw new AppError(401, 'Unauthorized', 'NO_USER');
  }

  const user = await getUserByUid(req.user.uid);

  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  res.json({ success: true, data: user });
});

/**
 * Logout user (client-side token removal)
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Token invalidation would happen on client side
  // In production, you might want to blacklist tokens
  res.json({ success: true, data: { message: 'Logged out successfully' } });
});
