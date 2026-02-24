import { Request, Response } from 'express';
import { getUserUsageStats } from '../services/firebaseService.js';
import { AppError } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get user analytics
 */
export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    throw new AppError(401, 'Unauthorized', 'NO_USER');
  }

  const days = parseInt(req.query.days as string) || 7;

  if (days < 1 || days > 90) {
    throw new AppError(400, 'Days must be between 1 and 90', 'INVALID_DAYS');
  }

  const stats = await getUserUsageStats(req.user.uid, days);

  // Calculate cost (using Qwen pricing as baseline)
  const costPerInputToken = 0.00008 / 1000; // $0.00008 per 1K tokens
  const costPerOutputToken = 0.00024 / 1000; // $0.00024 per 1K tokens
  const estimatedCost = stats.totalTokensUsed * (costPerInputToken + costPerOutputToken) * 0.5; // Rough estimate

  res.json({
    success: true,
    data: {
      ...stats,
      estimatedCost: estimatedCost.toFixed(4),
      period: {
        days,
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    },
  });
});

/**
 * Get tone breakdown
 */
export const getToneBreakdown = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    throw new AppError(401, 'Unauthorized', 'NO_USER');
  }

  const days = parseInt(req.query.days as string) || 7;
  const stats = await getUserUsageStats(req.user.uid, days);

  const toneData = Object.entries(stats.toneBreakdown).map(([tone, count]) => ({
    tone,
    count,
    percentage: ((count / stats.totalRequests) * 100).toFixed(1),
  }));

  res.json({
    success: true,
    data: {
      tones: toneData,
      total: stats.totalRequests,
    },
  });
});

/**
 * Get cost estimation
 */
export const getCostEstimation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    throw new AppError(401, 'Unauthorized', 'NO_USER');
  }

  const stats = await getUserUsageStats(req.user.uid, 30);

  // Different pricing models
  const models = {
    gemini: {
      name: 'Google Gemini (Free)',
      costPerRequest: 0,
      monthlyEstimate: 0,
    },
    openrouter: {
      name: 'OpenRouter (Free)',
      costPerRequest: 0,
      monthlyEstimate: 0,
    },
    groq: {
      name: 'Groq (Free)',
      costPerRequest: 0,
      monthlyEstimate: 0,
    },
    qwen: {
      name: 'Qwen 2.5',
      costPerRequest: (stats.totalTokensUsed / stats.totalRequests) * 0.00008 * 0.5,
      monthlyEstimate: (stats.totalTokensUsed / stats.totalRequests) * 0.00008 * 0.5 * stats.totalRequests * 30,
    },
    deepseek: {
      name: 'DeepSeek-V3',
      costPerRequest: (stats.totalTokensUsed / stats.totalRequests) * 0.00014 * 0.5,
      monthlyEstimate: (stats.totalTokensUsed / stats.totalRequests) * 0.00014 * 0.5 * stats.totalRequests * 30,
    },
    gpt4mini: {
      name: 'GPT-4 Mini',
      costPerRequest: (stats.totalTokensUsed / stats.totalRequests) * 0.0015 * 0.5,
      monthlyEstimate: (stats.totalTokensUsed / stats.totalRequests) * 0.0015 * 0.5 * stats.totalRequests * 30,
    },
  };

  res.json({
    success: true,
    data: {
      currentUsage: {
        totalRequests: stats.totalRequests,
        totalTokens: stats.totalTokensUsed,
        averageTokensPerRequest: (stats.totalTokensUsed / stats.totalRequests).toFixed(0),
      },
      models: Object.entries(models).map(([key, model]) => ({
        id: key,
        ...model,
        monthlyEstimate: model.monthlyEstimate.toFixed(2),
      })),
      recommendation: 'Use free tier (Gemini, OpenRouter, Groq) for MVP. Upgrade to Qwen when free tier is exhausted.',
    },
  });
});

/**
 * Get daily stats
 */
export const getDailyStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.uid) {
    throw new AppError(401, 'Unauthorized', 'NO_USER');
  }

  // This would require storing daily stats in Firebase
  // For now, return aggregated stats
  const stats = await getUserUsageStats(req.user.uid, 7);

  const dailyAverage = {
    requests: (stats.totalRequests / 7).toFixed(1),
    tokens: (stats.totalTokensUsed / 7).toFixed(0),
    responseTime: (stats.averageResponseTime / 1000).toFixed(2), // Convert to seconds
  };

  res.json({
    success: true,
    data: {
      dailyAverage,
      weeklyTotal: stats,
    },
  });
});
