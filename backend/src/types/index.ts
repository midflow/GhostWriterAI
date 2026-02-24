// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  tonePreferences?: string[];
  totalMessages: number;
  totalTokensUsed: number;
  subscriptionTier: 'free' | 'premium' | 'pro';
}

// Message types
export interface Message {
  id: string;
  userId: string;
  originalMessage: string;
  tone: string;
  suggestions: string[];
  selectedSuggestion?: string;
  createdAt: string;
  tokensUsed: number;
  cached: boolean;
}

export interface GenerateReplyRequest {
  message: string;
  tone: string;
  recentMessages?: string[];
}

export interface GenerateReplyResponse {
  suggestions: string[];
  cached: boolean;
  tokensUsed: number;
}

// Analytics types
export interface UsageStats {
  userId: string;
  date: string;
  totalRequests: number;
  totalTokensUsed: number;
  toneBreakdown: Record<string, number>;
  averageResponseTime: number;
}

export interface AnalyticsData {
  totalUsers: number;
  totalMessages: number;
  totalTokensUsed: number;
  averageTokensPerMessage: number;
  topTones: Array<{ tone: string; count: number }>;
  dailyActiveUsers: number;
}

// Auth types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  uid: string;
  email: string;
  token: string;
  expiresIn: string;
}

// LLM types
export interface LLMProvider {
  name: string;
  generateReply(message: string, tone: string, context: string[]): Promise<string[]>;
}

export interface LLMConfig {
  provider: 'gemini' | 'openrouter' | 'groq' | 'qwen' | 'hybrid';
  apiKey: string;
  model?: string;
}

// Cache types
export interface CacheEntry {
  key: string;
  value: string[];
  createdAt: number;
  expiresAt: number;
}

// Error types
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    statusCode: number;
  };
}

// Success types
export interface SuccessResponse<T> {
  success: true;
  data: T;
}
