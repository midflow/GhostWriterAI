import { Router } from 'express';
import {
  generateReply,
  saveMessageHandler,
  getMessages,
  deleteMessageHandler,
  searchMessages,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All message routes require authentication
router.use(authMiddleware);

/**
 * POST /api/messages/generate-reply
 * Generate reply suggestions for a message
 */
router.post('/generate-reply', generateReply);

/**
 * POST /api/messages
 * Save a message
 */
router.post('/', saveMessageHandler);

/**
 * GET /api/messages
 * Get user messages with pagination
 */
router.get('/', getMessages);

/**
 * GET /api/messages/search
 * Search messages
 */
router.get('/search', searchMessages);

/**
 * DELETE /api/messages/:messageId
 * Delete a message
 */
router.delete('/:messageId', deleteMessageHandler);

export default router;
