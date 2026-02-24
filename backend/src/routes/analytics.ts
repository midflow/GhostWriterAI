import { Router } from 'express';
import {
  getAnalytics,
  getToneBreakdown,
  getCostEstimation,
  getDailyStats,
} from '../controllers/analyticsController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

/**
 * GET /api/analytics
 * Get user analytics
 */
router.get('/', getAnalytics);

/**
 * GET /api/analytics/tone-breakdown
 * Get tone usage breakdown
 */
router.get('/tone-breakdown', getToneBreakdown);

/**
 * GET /api/analytics/cost
 * Get cost estimation for different LLM providers
 */
router.get('/cost', getCostEstimation);

/**
 * GET /api/analytics/daily
 * Get daily statistics
 */
router.get('/daily', getDailyStats);

export default router;
