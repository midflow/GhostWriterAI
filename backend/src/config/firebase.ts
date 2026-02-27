import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
let serviceAccount: any;

try {
  // Try to load from firebase-key.json in the backend directory
  serviceAccount = require('../../firebase-key.json');
  console.log('✅ Service account loaded from firebase-key.json');
} catch (error) {
  console.warn('⚠️  firebase-key.json not found. Using environment variables.');
  // Fallback to environment variables
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };
}

// Initialize Firebase Admin
const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID || 'ghostwriter-prod-7e1d4',
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'ghostwriter-prod-7e1d4.firebasestorage.app'
};

// Check if Firebase is already initialized
if (!admin.apps.length) {
  admin.initializeApp(firebaseConfig);
  console.log('✅ Firebase Admin SDK initialized');
} else {
  console.log('✅ Firebase Admin SDK already initialized');
}

// Get Firestore instance
export const db = admin.firestore();

// Get Auth instance
export const auth = admin.auth();

// Get Storage instance
export const storage = admin.storage();

// Configure Firestore settings for development
if (process.env.NODE_ENV === 'development') {
  db.settings({
    experimentalForceLongPolling: true,
    ignoreUndefinedProperties: true
  });
  console.log('✅ Firestore development settings applied');
}

// Export admin for other services
export default admin;

// Health check function
export async function checkFirebaseHealth(): Promise<boolean> {
  try {
    const testDoc = await db.collection('_health').doc('check').get();
    console.log('✅ Firebase health check passed');
    return true;
  } catch (error) {
    console.error('❌ Firebase health check failed:', error);
    return false;
  }
}

// Initialize collections
export async function initializeCollections(): Promise<void> {
  const collections = [
    'users',
    'messages',
    'toneProfiles',
    'analytics',
    'llmCache',
    'auditLogs'
  ];

  for (const collection of collections) {
    try {
      const snapshot = await db.collection(collection).limit(1).get();
      if (snapshot.empty) {
        await db.collection(collection).doc('_init').set({
          initialized: true,
          createdAt: new Date(),
          description: `${collection} collection initialized`
        });
        await db.collection(collection).doc('_init').delete();
        console.log(`✅ Collection '${collection}' initialized`);
      } else {
        console.log(`✅ Collection '${collection}' already exists`);
      }
    } catch (error) {
      console.error(`❌ Error initializing collection '${collection}':`, error);
    }
  }
}

// Create default tone profiles
export async function initializeToneProfiles(): Promise<void> {
  const defaultTones = [
    {
      id: 'friendly',
      name: 'Friendly',
      description: 'Warm, approachable, and conversational',
      emoji: '😊',
      examples: [
        'Hey! How are you doing?',
        'That sounds awesome!',
        'Thanks so much for that!'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Formal, respectful, and business-like',
      emoji: '💼',
      examples: [
        'I appreciate your input on this matter.',
        'Could you please provide more details?',
        'Thank you for your consideration.'
      ]
    },
    {
      id: 'casual',
      name: 'Casual',
      description: 'Relaxed, informal, and laid-back',
      emoji: '😎',
      examples: [
        'yo, whats up',
        'nah, im good',
        'lol thats funny'
      ]
    },
    {
      id: 'empathetic',
      name: 'Empathetic',
      description: 'Understanding, supportive, and compassionate',
      emoji: '❤️',
      examples: [
        'I totally understand how you feel.',
        'That must be really tough for you.',
        'I\'m here for you if you need anything.'
      ]
    },
    {
      id: 'humorous',
      name: 'Humorous',
      description: 'Funny, witty, and entertaining',
      emoji: '😂',
      examples: [
        'Well, that\'s one way to do it!',
        'I\'d laugh but I\'m too busy crying.',
        'Plot twist: it actually worked!'
      ]
    },
    {
      id: 'assertive',
      name: 'Assertive',
      description: 'Confident, direct, and straightforward',
      emoji: '💪',
      examples: [
        'Here\'s what needs to happen.',
        'I\'m confident this is the right call.',
        'Let\'s make this happen.'
      ]
    }
  ];

  try {
    for (const tone of defaultTones) {
      const toneRef = db.collection('toneProfiles').doc(tone.id);
      const doc = await toneRef.get();

      if (!doc.exists) {
        await toneRef.set({
          ...tone,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Tone profile '${tone.name}' created`);
      } else {
        console.log(`✅ Tone profile '${tone.name}' already exists`);
      }
    }
  } catch (error) {
    console.error('❌ Error initializing tone profiles:', error);
  }
}

// Setup Firestore indexes
export async function setupFirestoreIndexes(): Promise<void> {
  console.log('📋 Firestore indexes configuration:');
  console.log('   - Index 1: users (uid, createdAt)');
  console.log('   - Index 2: messages (uid, createdAt)');
  console.log('   - Index 3: analytics (uid, date)');
  console.log('   - Index 4: llmCache (hash, createdAt)');
  console.log('');
  console.log('⚠️  Composite indexes must be created manually in Firebase Console');
  console.log('   or will be auto-created on first query.');
}
