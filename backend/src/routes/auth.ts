import { Router } from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, logout);

export default router;
