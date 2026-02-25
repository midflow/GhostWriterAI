# Firestore Security Rules & Indexes

This document provides complete Firestore security rules and index configuration for Ghostwriter MVP.

---

## Table of Contents

1. [Security Rules Overview](#security-rules-overview)
2. [Firestore Rules](#firestore-rules)
3. [Index Configuration](#index-configuration)
4. [Testing Rules](#testing-rules)
5. [Troubleshooting](#troubleshooting)

---

## Security Rules Overview

Firestore security rules enforce access control at the database level. Rules determine who can read, write, update, or delete documents.

### Rule Structure

```
match /path/to/document {
  allow read: if <condition>;
  allow write: if <condition>;
  allow create: if <condition>;
  allow update: if <condition>;
  allow delete: if <condition>;
}
```

### Authentication

- **Anonymous:** No authentication required
- **Authenticated:** User logged in with Firebase Auth
- **Admin:** Backend service account

---

## Firestore Rules

**File:** `firestore.rules`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Check if user owns the resource
    function isOwner(uid) {
      return request.auth.uid == uid;
    }
    
    // Check if user is admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.accountType == 'admin';
    }
    
    // Validate email format
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }
    
    // Validate tone
    function isValidTone(tone) {
      return tone in ['friendly', 'professional', 'casual', 'formal', 'empathetic'];
    }
    
    // Validate account type
    function isValidAccountType(type) {
      return type in ['free', 'premium', 'pro'];
    }
    
    // Check if user has quota
    function hasQuota() {
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      return user.accountType == 'premium' || user.accountType == 'pro' || 
             (user.accountType == 'free' && user.totalMessagesGenerated < 5);
    }
    
    // ============================================
    // USERS COLLECTION
    // ============================================
    
    match /users/{uid} {
      // Read: User can read own profile, admins can read all
      allow read: if isOwner(uid) || isAdmin();
      
      // Create: Only during registration (via backend)
      allow create: if false;
      
      // Update: User can update own profile
      allow update: if isOwner(uid) && 
                       validate_user_update(resource.data, request.resource.data);
      
      // Delete: Only admins can delete
      allow delete: if isAdmin();
      
      // Validate user update
      function validate_user_update(oldData, newData) {
        // Cannot change uid, email, accountType
        return newData.uid == oldData.uid &&
               newData.email == oldData.email &&
               newData.accountType == oldData.accountType &&
               // Can only update specific fields
               newData.displayName is string &&
               newData.displayName.size() > 0 &&
               newData.displayName.size() <= 100 &&
               newData.bio.size() <= 500 &&
               newData.language is string &&
               newData.timezone is string &&
               newData.notificationsEnabled is bool &&
               newData.updatedAt > oldData.updatedAt;
      }
      
      // ============================================
      // MESSAGES SUBCOLLECTION
      // ============================================
      
      match /messages/{messageId} {
        // Read: User can read own messages
        allow read: if isOwner(uid);
        
        // Create: User can create messages if has quota
        allow create: if isOwner(uid) && 
                         hasQuota() &&
                         validate_message_create(request.resource.data);
        
        // Update: User can update own messages
        allow update: if isOwner(uid) && 
                         validate_message_update(resource.data, request.resource.data);
        
        // Delete: User can delete own messages
        allow delete: if isOwner(uid);
        
        // Validate message creation
        function validate_message_create(data) {
          return data.uid == request.auth.uid &&
                 data.originalMessage is string &&
                 data.originalMessage.size() > 0 &&
                 data.originalMessage.size() <= 1000 &&
                 isValidTone(data.selectedTone) &&
                 data.suggestions is list &&
                 data.suggestions.size() >= 3 &&
                 data.suggestions.size() <= 5 &&
                 data.tokensUsed is number &&
                 data.tokensUsed > 0 &&
                 data.createdAt == request.time &&
                 data.isDeleted == false;
        }
        
        // Validate message update
        function validate_message_update(oldData, newData) {
          return newData.uid == oldData.uid &&
                 newData.originalMessage == oldData.originalMessage &&
                 newData.suggestions == oldData.suggestions &&
                 // Can only update these fields
                 newData.selectedSuggestion is string &&
                 newData.userRating is number &&
                 newData.userRating >= 1 &&
                 newData.userRating <= 5 &&
                 newData.updatedAt > oldData.updatedAt;
        }
        
        // ============================================
        // REVISIONS SUBCOLLECTION
        // ============================================
        
        match /revisions/{revisionId} {
          // Read: User can read own revisions
          allow read: if isOwner(uid);
          
          // Create: System only (via backend)
          allow create: if false;
          
          // Update: Not allowed
          allow update: if false;
          
          // Delete: Not allowed
          allow delete: if false;
        }
      }
      
      // ============================================
      // TONE_PROFILES SUBCOLLECTION
      // ============================================
      
      match /tone_profiles/{toneId} {
        // Read: User can read own tone profiles
        allow read: if isOwner(uid);
        
        // Create: User can create tone profiles
        allow create: if isOwner(uid) && 
                         validate_tone_profile_create(request.resource.data);
        
        // Update: User can update own tone profiles
        allow update: if isOwner(uid) && 
                         validate_tone_profile_update(resource.data, request.resource.data);
        
        // Delete: User can delete own tone profiles
        allow delete: if isOwner(uid);
        
        // Validate tone profile creation
        function validate_tone_profile_create(data) {
          return data.uid == request.auth.uid &&
                 data.toneName is string &&
                 data.toneName.size() > 0 &&
                 data.toneName.size() <= 50 &&
                 data.toneDescription is string &&
                 data.toneDescription.size() <= 200 &&
                 data.isActive is bool &&
                 data.createdAt == request.time;
        }
        
        // Validate tone profile update
        function validate_tone_profile_update(oldData, newData) {
          return newData.uid == oldData.uid &&
                 newData.toneName is string &&
                 newData.toneName.size() > 0 &&
                 newData.toneName.size() <= 50 &&
                 newData.updatedAt > oldData.updatedAt;
        }
      }
      
      // ============================================
      // ANALYTICS SUBCOLLECTION
      // ============================================
      
      match /analytics/{analyticsId} {
        // Read: User can read own analytics
        allow read: if isOwner(uid);
        
        // Create: System only (via backend)
        allow create: if false;
        
        // Update: System only (via backend)
        allow update: if false;
        
        // Delete: Not allowed
        allow delete: if false;
      }
    }
    
    // ============================================
    // LLM_CACHE COLLECTION
    // ============================================
    
    match /llm_cache/{cacheId} {
      // Read: Anyone can read cache (public)
      allow read: if true;
      
      // Write: Backend service only
      allow write: if request.auth.uid == null;
      
      // Delete: Backend service only
      allow delete: if request.auth.uid == null;
    }
    
    // ============================================
    // AUDIT_LOGS COLLECTION
    // ============================================
    
    match /audit_logs/{logId} {
      // Read: Only admins and resource owner
      allow read: if isAdmin() || 
                     isOwner(resource.data.uid);
      
      // Write: Backend service only
      allow write: if request.auth.uid == null;
      
      // Delete: Not allowed
      allow delete: if false;
    }
    
    // ============================================
    // DENY ALL BY DEFAULT
    // ============================================
    
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Index Configuration

**File:** `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "selectedTone",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isDeleted",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "analytics",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "llm_cache",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "messageHash",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "tone",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "audit_logs",
      "queryScope": "Collection",
      "fields": [
        {
          "fieldPath": "uid",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": [
    {
      "collectionGroup": "llm_cache",
      "fieldPath": "expiresAt",
      "ttl": true
    }
  ]
}
```

---

## Testing Rules

### Test File

**File:** `backend/src/__tests__/firestore.rules.test.ts`

```typescript
import * as admin from 'firebase-admin';
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv: RulesTestEnvironment;
  
  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'ghostwriter-test',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
        host: 'localhost',
        port: 8080
      }
    });
  });
  
  afterAll(async () => {
    await testEnv.cleanup();
  });
  
  afterEach(async () => {
    await testEnv.clearFirestore();
  });
  
  describe('Users Collection', () => {
    it('should allow user to read own profile', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').get()
      ).toBeResolved();
    });
    
    it('should deny user reading other profiles', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('bob').get()
      ).toBeRejectedWithError();
    });
    
    it('should allow user to update own profile', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').update({
          displayName: 'Alice Updated',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      ).toBeResolved();
    });
    
    it('should deny updating protected fields', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').update({
          email: 'newemail@example.com'
        })
      ).toBeRejectedWithError();
    });
  });
  
  describe('Messages Collection', () => {
    it('should allow user to create message', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').collection('messages').add({
          uid: 'alice',
          originalMessage: 'Hello world',
          selectedTone: 'friendly',
          suggestions: ['Hi there', 'Hey', 'Hello'],
          tokensUsed: 100,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isDeleted: false
        })
      ).toBeResolved();
    });
    
    it('should deny invalid tone', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').collection('messages').add({
          uid: 'alice',
          originalMessage: 'Hello world',
          selectedTone: 'invalid_tone',
          suggestions: ['Hi there', 'Hey', 'Hello'],
          tokensUsed: 100,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isDeleted: false
        })
      ).toBeRejectedWithError();
    });
    
    it('should deny reading other user messages', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const bob = testEnv.authenticatedContext('bob');
      const db = bob.firestore();
      
      await expectAsync(
        db.collection('users').doc('alice').collection('messages').get()
      ).toBeRejectedWithError();
    });
  });
  
  describe('LLM Cache Collection', () => {
    it('should allow anyone to read cache', async () => {
      const unauth = testEnv.unauthenticatedContext();
      const db = unauth.firestore();
      
      await expectAsync(
        db.collection('llm_cache').get()
      ).toBeResolved();
    });
  });
  
  describe('Audit Logs Collection', () => {
    it('should deny unauthorized read', async () => {
      const alice = testEnv.authenticatedContext('alice');
      const db = alice.firestore();
      
      await expectAsync(
        db.collection('audit_logs').get()
      ).toBeRejectedWithError();
    });
  });
});
```

---

## Deploying Rules

### Deploy to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# Deploy both
firebase deploy --only firestore
```

### Verify Deployment

```bash
# View current rules
firebase firestore:indexes

# View rule status
firebase firestore:rules:status
```

---

## Monitoring & Debugging

### View Rule Violations

```bash
# View Firestore logs
gcloud logging read "resource.type=cloud_firestore" --limit 50

# Filter by error
gcloud logging read "resource.type=cloud_firestore AND severity=ERROR" --limit 50
```

### Performance Monitoring

```bash
# View slow queries
gcloud monitoring dashboards create --config-from-file=dashboard.yaml

# Set up alerts
gcloud alpha monitoring policies create --notification-channels=<channel-id>
```

---

## Best Practices

1. **Principle of Least Privilege** - Grant minimum required permissions
2. **Validate Data** - Always validate data in rules
3. **Test Rules** - Write comprehensive rule tests
4. **Monitor Access** - Log all access attempts
5. **Update Regularly** - Review and update rules quarterly
6. **Document Rules** - Add comments explaining each rule
7. **Use Functions** - Extract common logic into functions
8. **Avoid Wildcards** - Be specific with paths

---

## Troubleshooting

### Common Issues

**Issue:** "Permission denied" error

**Solution:** Check if user is authenticated and has correct permissions

```typescript
// Add logging to debug
console.log('User UID:', request.auth.uid);
console.log('Resource UID:', resource.data.uid);
```

**Issue:** Rules too restrictive

**Solution:** Use testing environment to debug

```bash
firebase emulators:start --only firestore
```

**Issue:** Slow queries

**Solution:** Create composite indexes

```bash
firebase firestore:indexes
```

