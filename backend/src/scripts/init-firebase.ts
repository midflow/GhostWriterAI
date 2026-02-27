import { initializeCollections, initializeToneProfiles, setupFirestoreIndexes, checkFirebaseHealth } from '../config/firebase';

async function main() {
  console.log('🚀 Starting Firebase initialization...\n');

  try {
    // Check Firebase health
    console.log('📋 Step 1: Checking Firebase health...');
    const isHealthy = await checkFirebaseHealth();
    if (!isHealthy) {
      console.warn('⚠️  Firebase health check failed, but continuing...');
    }
    console.log('');

    // Initialize collections
    console.log('📋 Step 2: Initializing Firestore collections...');
    await initializeCollections();
    console.log('');

    // Initialize tone profiles
    console.log('📋 Step 3: Initializing tone profiles...');
    await initializeToneProfiles();
    console.log('');

    // Setup indexes
    console.log('📋 Step 4: Setting up Firestore indexes...');
    await setupFirestoreIndexes();
    console.log('');

    console.log('✅ Firebase initialization completed successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Verify collections in Firebase Console');
    console.log('   2. Create composite indexes if needed');
    console.log('   3. Run: npm run dev');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    process.exit(1);
  }
}

main();
