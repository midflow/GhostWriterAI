# Database Schema & Data Models

This document defines the complete database schema for Ghostwriter MVP using Firebase Firestore.

---

## Table of Contents

1. [Overview](#overview)
2. [Collections](#collections)
3. [Data Models](#data-models)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Constraints & Validation](#constraints--validation)
7. [Query Patterns](#query-patterns)

---

## Overview

Ghostwriter uses **Firebase Firestore** as the primary database. Firestore is a NoSQL document database that scales automatically and provides real-time updates.

### Database Architecture

```
Firestore Database
├── users/                    # User profiles and settings
├── messages/                 # Generated messages and history
├── analytics/                # User analytics and usage stats
├── tone_profiles/            # User tone preferences
├── llm_cache/                # Cached LLM responses
└── audit_logs/               # Security audit logs
```

### Design Principles

1. **Denormalization** - Duplicate data for query performance
2. **Subcollections** - Organize related data hierarchically
3. **Timestamps** - Track creation and modification times
4. **Soft deletes** - Mark deleted documents instead of removing
5. **Indexing** - Create indexes for common queries
6. **Security** - Firestore rules enforce access control

---

## Collections

### 1. Users Collection

**Path:** `users/{uid}`

**Purpose:** Store user profiles and account information

**Document Structure:**

```typescript
interface User {
  // Identity
  uid: string;                          // Firebase Auth UID (document ID)
  email: string;                        // User email (indexed)
  displayName: string;                  // User display name
  
  // Account
  accountType: 'free' | 'premium' | 'pro';  // Subscription tier
  createdAt: Timestamp;                 // Account creation date
  updatedAt: Timestamp;                 // Last update date
  lastLoginAt: Timestamp;               // Last login timestamp
  
  // Profile
  profilePicture?: string;              // Profile image URL
  bio?: string;                         // User bio (max 500 chars)
  
  // Preferences
  language: string;                     // Preferred language (en, vi, etc.)
  timezone: string;                     // User timezone
  notificationsEnabled: boolean;        // Email notifications
  
  // Usage
  totalMessagesGenerated: number;       // Total messages generated
  totalTokensUsed: number;              // Total LLM tokens used
  currentMonthTokensUsed: number;       // Tokens used this month
  
  // Subscription
  subscriptionStartDate?: Timestamp;    // Premium subscription start
  subscriptionEndDate?: Timestamp;      // Premium subscription end
  paymentMethodId?: string;             // Stripe payment method ID
  
  // Status
  isActive: boolean;                    // Account active status
  isVerified: boolean;                  // Email verified
  isDeleted: boolean;                   // Soft delete flag
  deletedAt?: Timestamp;                // Deletion timestamp
  
  // Metadata
  metadata?: {
    referralCode?: string;
    referredBy?: string;
    source?: string;                    // How user found app
  };
}
```

**Indexes:**

```
- email (ascending)
- accountType (ascending)
- createdAt (descending)
- isActive (ascending)
- lastLoginAt (descending)
```

**Subcollections:**

- `users/{uid}/tone_profiles` - User tone preferences
- `users/{uid}/messages` - User message history
- `users/{uid}/analytics` - User analytics data

---

### 2. Messages Collection

**Path:** `messages/{messageId}`

**Purpose:** Store generated messages and history

**Document Structure:**

```typescript
interface Message {
  // Identity
  id: string;                           // Document ID (auto-generated)
  uid: string;                          // User ID (indexed)
  
  // Content
  originalMessage: string;              // Original user message
  originalMessageLength: number;        // Character count
  
  // Tone
  selectedTone: string;                 // Selected tone (friendly, professional, etc.)
  toneConfidence: number;               // Tone detection confidence (0-100)
  
  // Suggestions
  suggestions: string[];                // Array of 3-5 suggestions
  selectedSuggestion?: string;          // User selected suggestion
  selectedSuggestionIndex?: number;     // Index of selected suggestion
  
  // LLM
  llmProvider: 'gemini' | 'openrouter' | 'groq' | 'together' | 'qwen';
  llmModel: string;                     // Model name (e.g., "gpt-3.5-turbo")
  tokensUsed: number;                   // Tokens consumed
  llmLatency: number;                   // Response time in ms
  
  // Feedback
  userRating?: number;                  // User rating (1-5)
  userFeedback?: string;                // User feedback text
  isHelpful?: boolean;                  // Helpful flag
  
  // Metadata
  context?: {
    platform?: string;                  // Where message is used (email, slack, etc.)
    conversationId?: string;            // Conversation context
    recentMessages?: string[];          // Recent message history
  };
  
  // Timestamps
  createdAt: Timestamp;                 // Creation time
  updatedAt: Timestamp;                 // Last update
  expiresAt?: Timestamp;                // Auto-delete after 90 days
  
  // Status
  isDeleted: boolean;                   // Soft delete flag
  isFlagged: boolean;                   // Content moderation flag
}
```

**Indexes:**

```
- uid + createdAt (descending)
- uid + selectedTone (ascending)
- uid + isDeleted (ascending)
- createdAt (descending)
- llmProvider (ascending)
```

**Subcollections:**

- `messages/{messageId}/revisions` - Message edit history

---

### 3. ToneProfiles Collection

**Path:** `users/{uid}/tone_profiles/{toneId}`

**Purpose:** Store user tone preferences and customizations

**Document Structure:**

```typescript
interface ToneProfile {
  // Identity
  id: string;                           // Document ID
  uid: string;                          // User ID
  
  // Tone
  toneName: string;                     // Tone name (friendly, professional, etc.)
  toneDescription: string;              // Description
  
  // Customization
  customInstructions?: string;          // Custom tone instructions
  customExamples?: string[];            // Example messages for this tone
  
  // Settings
  isDefault: boolean;                   // Is default tone
  isActive: boolean;                    // Is active
  
  // Statistics
  usageCount: number;                   // Times used
  lastUsedAt?: Timestamp;               // Last usage time
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 4. Analytics Collection

**Path:** `users/{uid}/analytics/{analyticsId}`

**Purpose:** Store user analytics and usage statistics

**Document Structure:**

```typescript
interface Analytics {
  // Identity
  id: string;                           // Document ID
  uid: string;                          // User ID
  
  // Period
  period: 'daily' | 'weekly' | 'monthly';
  date: Timestamp;                      // Date of analytics
  
  // Usage
  messagesGenerated: number;            // Messages generated in period
  tokensUsed: number;                   // Tokens used in period
  averageLatency: number;               // Average LLM latency (ms)
  
  // Tone Breakdown
  toneBreakdown: {
    [toneName: string]: {
      count: number;
      percentage: number;
    };
  };
  
  // LLM Breakdown
  llmBreakdown: {
    [provider: string]: {
      count: number;
      tokensUsed: number;
      averageLatency: number;
    };
  };
  
  // Engagement
  averageRating: number;                // Average user rating
  helpfulCount: number;                 // Helpful messages count
  unhelpfulCount: number;               // Unhelpful messages count
  
  // Cost
  estimatedCost: number;                // Estimated API cost
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### 5. LLMCache Collection

**Path:** `llm_cache/{cacheId}`

**Purpose:** Cache LLM responses to reduce API calls

**Document Structure:**

```typescript
interface LLMCache {
  // Identity
  id: string;                           // Document ID
  
  // Query
  messageHash: string;                  // Hash of original message (indexed)
  tone: string;                         // Tone (indexed)
  messageLength: number;                // Message length
  
  // Response
  suggestions: string[];                // Cached suggestions
  llmProvider: string;                  // Provider used
  llmModel: string;                     // Model used
  
  // Metadata
  hitCount: number;                     // Cache hit count
  lastHitAt: Timestamp;                 // Last cache hit
  
  // Timestamps
  createdAt: Timestamp;
  expiresAt: Timestamp;                 // TTL: 30 days
  
  // Status
  isValid: boolean;                     // Cache validity
}
```

**Indexes:**

```
- messageHash + tone (ascending)
- expiresAt (ascending)
- lastHitAt (descending)
```

---

### 6. AuditLogs Collection

**Path:** `audit_logs/{logId}`

**Purpose:** Track security and compliance events

**Document Structure:**

```typescript
interface AuditLog {
  // Identity
  id: string;                           // Document ID
  
  // Event
  eventType: string;                    // Event type (login, logout, delete, etc.)
  eventAction: string;                  // Action performed
  
  // User
  uid: string;                          // User ID (indexed)
  email: string;                        // User email
  
  // Details
  resourceType: string;                 // Resource type (user, message, etc.)
  resourceId: string;                   // Resource ID
  changes?: {
    before: any;
    after: any;
  };
  
  // Status
  status: 'success' | 'failure';
  errorMessage?: string;
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  
  // Timestamps
  createdAt: Timestamp;
}
```

**Indexes:**

```
- uid + createdAt (descending)
- eventType (ascending)
- createdAt (descending)
```

---

## Data Models

### TypeScript Interfaces

**File:** `backend/src/types/database.ts`

```typescript
// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  accountType: 'free' | 'premium' | 'pro';
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  lastLoginAt: admin.firestore.Timestamp;
  profilePicture?: string;
  bio?: string;
  language: string;
  timezone: string;
  notificationsEnabled: boolean;
  totalMessagesGenerated: number;
  totalTokensUsed: number;
  currentMonthTokensUsed: number;
  subscriptionStartDate?: admin.firestore.Timestamp;
  subscriptionEndDate?: admin.firestore.Timestamp;
  paymentMethodId?: string;
  isActive: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  deletedAt?: admin.firestore.Timestamp;
  metadata?: {
    referralCode?: string;
    referredBy?: string;
    source?: string;
  };
}

// Message Types
export interface Message {
  id: string;
  uid: string;
  originalMessage: string;
  originalMessageLength: number;
  selectedTone: string;
  toneConfidence: number;
  suggestions: string[];
  selectedSuggestion?: string;
  selectedSuggestionIndex?: number;
  llmProvider: 'gemini' | 'openrouter' | 'groq' | 'together' | 'qwen';
  llmModel: string;
  tokensUsed: number;
  llmLatency: number;
  userRating?: number;
  userFeedback?: string;
  isHelpful?: boolean;
  context?: {
    platform?: string;
    conversationId?: string;
    recentMessages?: string[];
  };
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
  expiresAt?: admin.firestore.Timestamp;
  isDeleted: boolean;
  isFlagged: boolean;
}

// Analytics Types
export interface Analytics {
  id: string;
  uid: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: admin.firestore.Timestamp;
  messagesGenerated: number;
  tokensUsed: number;
  averageLatency: number;
  toneBreakdown: Record<string, { count: number; percentage: number }>;
  llmBreakdown: Record<string, { count: number; tokensUsed: number; averageLatency: number }>;
  averageRating: number;
  helpfulCount: number;
  unhelpfulCount: number;
  estimatedCost: number;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// Tone Profile Types
export interface ToneProfile {
  id: string;
  uid: string;
  toneName: string;
  toneDescription: string;
  customInstructions?: string;
  customExamples?: string[];
  isDefault: boolean;
  isActive: boolean;
  usageCount: number;
  lastUsedAt?: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

// LLM Cache Types
export interface LLMCache {
  id: string;
  messageHash: string;
  tone: string;
  messageLength: number;
  suggestions: string[];
  llmProvider: string;
  llmModel: string;
  hitCount: number;
  lastHitAt: admin.firestore.Timestamp;
  createdAt: admin.firestore.Timestamp;
  expiresAt: admin.firestore.Timestamp;
  isValid: boolean;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  eventType: string;
  eventAction: string;
  uid: string;
  email: string;
  resourceType: string;
  resourceId: string;
  changes?: {
    before: any;
    after: any;
  };
  status: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: admin.firestore.Timestamp;
}
```

---

## Relationships

### User → Messages (One-to-Many)

```
users/{uid}
  └── messages/{messageId}
      ├── originalMessage
      ├── selectedTone
      └── suggestions[]
```

**Query:** Get all messages for a user

```typescript
db.collection('users').doc(uid)
  .collection('messages')
  .orderBy('createdAt', 'desc')
  .limit(50)
```

### User → ToneProfiles (One-to-Many)

```
users/{uid}
  └── tone_profiles/{toneId}
      ├── toneName
      ├── customInstructions
      └── customExamples[]
```

### User → Analytics (One-to-Many)

```
users/{uid}
  └── analytics/{analyticsId}
      ├── period
      ├── messagesGenerated
      └── tokensUsed
```

### Message → Revisions (One-to-Many)

```
messages/{messageId}
  └── revisions/{revisionId}
      ├── originalMessage
      ├── selectedSuggestion
      └── timestamp
```

---

## Indexes

### Composite Indexes

| Collection | Fields | Order | Purpose |
|-----------|--------|-------|---------|
| messages | uid, createdAt | asc, desc | User message history |
| messages | uid, selectedTone | asc, asc | Messages by tone |
| analytics | uid, date | asc, desc | User analytics |
| llm_cache | messageHash, tone | asc, asc | Cache lookup |
| audit_logs | uid, createdAt | asc, desc | User audit trail |

### Single Field Indexes

| Collection | Field | Order | Purpose |
|-----------|-------|-------|---------|
| users | email | asc | User lookup |
| users | createdAt | desc | Recent users |
| messages | createdAt | desc | Recent messages |
| llm_cache | expiresAt | asc | TTL cleanup |

---

## Constraints & Validation

### User Validation

```typescript
// Email must be valid
email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Display name: 1-100 characters
displayName: { minLength: 1, maxLength: 100 }

// Bio: max 500 characters
bio: { maxLength: 500 }

// Account type must be one of
accountType: { enum: ['free', 'premium', 'pro'] }
```

### Message Validation

```typescript
// Original message: 1-1000 characters
originalMessage: { minLength: 1, maxLength: 1000 }

// Tone must be valid
selectedTone: { enum: ['friendly', 'professional', 'casual', 'formal', 'empathetic'] }

// Suggestions: array of 3-5 strings
suggestions: { minItems: 3, maxItems: 5 }

// User rating: 1-5
userRating: { minimum: 1, maximum: 5 }
```

### Analytics Validation

```typescript
// Period must be valid
period: { enum: ['daily', 'weekly', 'monthly'] }

// Counts must be non-negative
messagesGenerated: { minimum: 0 }
tokensUsed: { minimum: 0 }

// Percentage: 0-100
percentage: { minimum: 0, maximum: 100 }
```

---

## Query Patterns

### 1. Get User Profile

```typescript
const userDoc = await db.collection('users').doc(uid).get();
const user = userDoc.data() as User;
```

### 2. Get User Messages (Paginated)

```typescript
let query = db.collection('users').doc(uid)
  .collection('messages')
  .orderBy('createdAt', 'desc');

if (lastDoc) {
  query = query.startAfter(lastDoc);
}

const messages = await query.limit(20).get();
```

### 3. Get Messages by Tone

```typescript
const messages = await db.collection('users').doc(uid)
  .collection('messages')
  .where('selectedTone', '==', 'friendly')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();
```

### 4. Get User Analytics

```typescript
const analytics = await db.collection('users').doc(uid)
  .collection('analytics')
  .where('period', '==', 'daily')
  .orderBy('date', 'desc')
  .limit(30)
  .get();
```

### 5. Get Cached Suggestions

```typescript
const cached = await db.collection('llm_cache')
  .where('messageHash', '==', hash)
  .where('tone', '==', tone)
  .where('isValid', '==', true)
  .limit(1)
  .get();
```

### 6. Get Audit Logs

```typescript
const logs = await db.collection('audit_logs')
  .where('uid', '==', uid)
  .orderBy('createdAt', 'desc')
  .limit(100)
  .get();
```

---

## Performance Optimization

### Denormalization Strategy

To improve query performance, we denormalize frequently accessed data:

**Example:** Store user email in audit logs

```typescript
// Instead of querying users collection
const auditLog = {
  uid: 'user_123',
  email: 'user@example.com',  // Denormalized
  eventType: 'message_created'
};
```

### Caching Strategy

1. **LLM Response Cache** - Cache suggestions for 30 days
2. **User Profile Cache** - Cache in memory for 1 hour
3. **Analytics Cache** - Cache in memory for 1 day

### Batch Operations

For bulk operations, use batch writes:

```typescript
const batch = db.batch();

messages.forEach(msg => {
  const docRef = db.collection('messages').doc(msg.id);
  batch.update(docRef, { isDeleted: true });
});

await batch.commit();
```

---

## Data Retention & Cleanup

### TTL Policy

| Collection | Retention | Action |
|-----------|-----------|--------|
| messages | 90 days | Auto-delete |
| llm_cache | 30 days | Auto-delete |
| audit_logs | 1 year | Archive |
| analytics | Indefinite | Keep |

### Cleanup Job

```typescript
// Run daily at 2 AM
export const cleanupExpiredData = functions.pubsub
  .schedule('0 2 * * *')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    
    // Delete expired messages
    const expiredMessages = await db.collection('messages')
      .where('expiresAt', '<', now)
      .get();
    
    const batch = db.batch();
    expiredMessages.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  });
```

---

## Backup & Recovery

### Automated Backups

- Daily backups to Cloud Storage
- 30-day retention
- Point-in-time recovery available

### Backup Command

```bash
gcloud firestore export gs://ghostwriter-backups/backup-$(date +%Y%m%d)
```

### Restore Command

```bash
gcloud firestore import gs://ghostwriter-backups/backup-20240101
```

