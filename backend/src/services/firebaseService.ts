import { db, auth } from '../config/firebase.js';
import { User, UserProfile, Message } from '../types/index.js';
import bcryptjs from 'bcryptjs';

/**
 * Create a new user in Firebase
 */
export async function createUser(email: string, password: string): Promise<User> {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: email.split('@')[0],
    });

    // Create user profile in Realtime Database
    const userProfile: UserProfile = {
      uid: userRecord.uid,
      email,
      displayName: userRecord.displayName || email.split('@')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalMessages: 0,
      totalTokensUsed: 0,
      subscriptionTier: 'free',
    };

    await db.ref(`users/${userRecord.uid}`).set(userProfile);

    return {
      uid: userRecord.uid,
      email,
      displayName: userProfile.displayName,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    };
  } catch (error) {
    throw new Error(`Failed to create user: ${(error as Error).message}`);
  }
}

/**
 * Get user by UID
 */
export async function getUserByUid(uid: string): Promise<UserProfile | null> {
  try {
    const snapshot = await db.ref(`users/${uid}`).get();
    return snapshot.val() as UserProfile | null;
  } catch (error) {
    throw new Error(`Failed to get user: ${(error as Error).message}`);
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    await db.ref(`users/${uid}`).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw new Error(`Failed to update user: ${(error as Error).message}`);
  }
}

/**
 * Save a message to database
 */
export async function saveMessage(
  userId: string,
  message: Message
): Promise<string> {
  try {
    const messageRef = db.ref(`messages/${userId}`).push();
    const messageId = messageRef.key;

    await messageRef.set({
      ...message,
      id: messageId,
      createdAt: new Date().toISOString(),
    });

    // Update user stats
    const user = await getUserByUid(userId);
    if (user) {
      await updateUserProfile(userId, {
        totalMessages: (user.totalMessages || 0) + 1,
        totalTokensUsed: (user.totalTokensUsed || 0) + message.tokensUsed,
      });
    }

    return messageId!;
  } catch (error) {
    throw new Error(`Failed to save message: ${(error as Error).message}`);
  }
}

/**
 * Get user messages
 */
export async function getUserMessages(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Message[]> {
  try {
    const snapshot = await db
      .ref(`messages/${userId}`)
      .orderByChild('createdAt')
      .limitToLast(limit + offset)
      .get();

    const messages = snapshot.val() as Record<string, Message> | null;
    if (!messages) return [];

    return Object.values(messages)
      .reverse()
      .slice(offset, offset + limit);
  } catch (error) {
    throw new Error(`Failed to get messages: ${(error as Error).message}`);
  }
}

/**
 * Delete a message
 */
export async function deleteMessage(userId: string, messageId: string): Promise<void> {
  try {
    await db.ref(`messages/${userId}/${messageId}`).remove();
  } catch (error) {
    throw new Error(`Failed to delete message: ${(error as Error).message}`);
  }
}

/**
 * Log usage statistics
 */
export async function logUsage(
  userId: string,
  tone: string,
  tokensUsed: number,
  responseTime: number
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const usageRef = db.ref(`usage/${userId}/${today}`);

    const snapshot = await usageRef.get();
    const currentData = snapshot.val() || {
      totalRequests: 0,
      totalTokensUsed: 0,
      toneBreakdown: {},
      totalResponseTime: 0,
    };

    const toneBreakdown = currentData.toneBreakdown || {};
    toneBreakdown[tone] = (toneBreakdown[tone] || 0) + 1;

    await usageRef.set({
      totalRequests: currentData.totalRequests + 1,
      totalTokensUsed: currentData.totalTokensUsed + tokensUsed,
      toneBreakdown,
      totalResponseTime: currentData.totalResponseTime + responseTime,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log usage:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string, days: number = 7) {
  try {
    const snapshot = await db.ref(`usage/${userId}`).get();
    const usageData = snapshot.val() || {};

    const stats = {
      totalRequests: 0,
      totalTokensUsed: 0,
      toneBreakdown: {} as Record<string, number>,
      averageResponseTime: 0,
      totalResponseTime: 0,
    };

    Object.values(usageData).forEach((day: any) => {
      stats.totalRequests += day.totalRequests || 0;
      stats.totalTokensUsed += day.totalTokensUsed || 0;
      stats.totalResponseTime += day.totalResponseTime || 0;

      // Merge tone breakdown
      Object.entries(day.toneBreakdown || {}).forEach(([tone, count]: [string, any]) => {
        stats.toneBreakdown[tone] = (stats.toneBreakdown[tone] || 0) + count;
      });
    });

    stats.averageResponseTime =
      stats.totalRequests > 0 ? stats.totalResponseTime / stats.totalRequests : 0;

    return stats;
  } catch (error) {
    throw new Error(`Failed to get usage stats: ${(error as Error).message}`);
  }
}
