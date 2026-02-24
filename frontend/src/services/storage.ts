import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_ID: 'userId',
  USER_EMAIL: 'userEmail',
  RECENT_MESSAGES: 'recentMessages',
};

class StorageService {
  /**
   * Save auth token securely
   */
  async saveAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
      throw error;
    }
  }

  /**
   * Get auth token
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /**
   * Remove auth token
   */
  async removeAuthToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to remove auth token:', error);
    }
  }

  /**
   * Save user info
   */
  async saveUserInfo(userId: string, email: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_EMAIL, email);
    } catch (error) {
      console.error('Failed to save user info:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  async getUserInfo(): Promise<{ userId: string | null; email: string | null }> {
    try {
      const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
      const email = await SecureStore.getItemAsync(STORAGE_KEYS.USER_EMAIL);
      return { userId, email };
    } catch (error) {
      console.error('Failed to get user info:', error);
      return { userId: null, email: null };
    }
  }

  /**
   * Clear all auth data
   */
  async clearAuthData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_EMAIL);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Save recent messages
   */
  async saveRecentMessages(messages: string[]): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        STORAGE_KEYS.RECENT_MESSAGES,
        JSON.stringify(messages.slice(-10)) // Keep only last 10
      );
    } catch (error) {
      console.error('Failed to save recent messages:', error);
    }
  }

  /**
   * Get recent messages
   */
  async getRecentMessages(): Promise<string[]> {
    try {
      const data = await SecureStore.getItemAsync(STORAGE_KEYS.RECENT_MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get recent messages:', error);
      return [];
    }
  }
}

export const storageService = new StorageService();
export default storageService;
