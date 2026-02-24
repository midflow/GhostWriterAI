import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/index.js';

/**
 * Global error handling middleware
 */
export function errorHandler(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  // Handle AppError instances
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
    res.status(error.statusCode).json(response);
    return;
  }

  // Handle other errors
  const response: ErrorResponse = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode: 500,
    },
  };
  res.status(500).json(response);
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
  };
  res.status(404).json(response);
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
