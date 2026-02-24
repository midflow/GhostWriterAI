// Auth types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Message types
export interface Message {
  id: string;
  originalMessage: string;
  tone: string;
  suggestions: string[];
  selectedSuggestion?: string;
  createdAt: string;
  tokensUsed: number;
}

export interface MessageState {
  messages: Message[];
  currentMessage: Message | null;
  loading: boolean;
  error: string | null;
  recentMessages: string[];
}

// Analytics types
export interface UsageStats {
  totalRequests: number;
  totalTokensUsed: number;
  toneBreakdown: Record<string, number>;
  averageResponseTime: number;
}

export interface AnalyticsState {
  stats: UsageStats | null;
  toneData: Array<{ tone: string; count: number }>;
  costEstimation: any;
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode: number;
  };
}

// Tone types
export type Tone = 'friendly' | 'professional' | 'assertive' | 'apologetic' | 'casual';

export const TONES: Tone[] = ['friendly', 'professional', 'assertive', 'apologetic', 'casual'];

export const TONE_DESCRIPTIONS: Record<Tone, string> = {
  friendly: 'Warm and approachable',
  professional: 'Formal and business-appropriate',
  assertive: 'Confident and direct',
  apologetic: 'Sorry and regretful',
  casual: 'Relaxed and informal',
};
