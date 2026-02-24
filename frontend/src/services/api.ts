import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000');

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token and redirect to login
          SecureStore.deleteItemAsync('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(email: string, password: string) {
    const response = await this.client.post('/auth/register', { email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  // Message endpoints
  async generateReply(message: string, tone: string, recentMessages: string[] = []) {
    const response = await this.client.post('/messages/generate-reply', {
      message,
      tone,
      recentMessages,
    });
    return response.data;
  }

  async saveMessage(
    originalMessage: string,
    tone: string,
    suggestions: string[],
    selectedSuggestion?: string,
    tokensUsed: number = 0
  ) {
    const response = await this.client.post('/messages', {
      originalMessage,
      tone,
      suggestions,
      selectedSuggestion,
      tokensUsed,
    });
    return response.data;
  }

  async getMessages(limit: number = 50, offset: number = 0) {
    const response = await this.client.get('/messages', {
      params: { limit, offset },
    });
    return response.data;
  }

  async deleteMessage(messageId: string) {
    const response = await this.client.delete(`/messages/${messageId}`);
    return response.data;
  }

  async searchMessages(query: string, tone?: string) {
    const response = await this.client.get('/messages/search', {
      params: { query, tone },
    });
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(days: number = 7) {
    const response = await this.client.get('/analytics', {
      params: { days },
    });
    return response.data;
  }

  async getToneBreakdown(days: number = 7) {
    const response = await this.client.get('/analytics/tone-breakdown', {
      params: { days },
    });
    return response.data;
  }

  async getCostEstimation() {
    const response = await this.client.get('/analytics/cost');
    return response.data;
  }

  async getDailyStats() {
    const response = await this.client.get('/analytics/daily');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
