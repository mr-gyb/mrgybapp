import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Backfill script to add missing arrays to existing user documents
 * This script should only be run in development environment
 */
async function backfillUsers() {
  try {
    console.log('🚀 Starting user backfill process...');
    
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    
    let updatedCount = 0;
    const updates: Array<{ uid: string; changes: string[] }> = [];
    
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      const changes: string[] = [];
      
      // Check what fields are missing
      if (!userData.friends) {
        userData.friends = [];
        changes.push('friends');
      }
      
      if (!userData.pendingRequests) {
        userData.pendingRequests = [];
        changes.push('pendingRequests');
      }
      
      if (!userData.sentRequests) {
        userData.sentRequests = [];
        changes.push('sentRequests');
      }
      
      if (!userData.notifications) {
        userData.notifications = [];
        changes.push('notifications');
      }
      
      // Only update if there are changes
      if (changes.length > 0) {
        await updateDoc(doc(usersCollection, userDoc.id), {
          friends: userData.friends,
          pendingRequests: userData.pendingRequests,
          sentRequests: userData.sentRequests,
          notifications: userData.notifications,
          updatedAt: serverTimestamp()
        });
        
        updatedCount++;
        updates.push({
          uid: userDoc.id,
          changes
        });
        
        console.log(`✅ Updated user ${userDoc.id}: added ${changes.join(', ')}`);
      }
    }
    
    console.log(`\n🎉 Backfill completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Total users processed: ${snapshot.docs.length}`);
    console.log(`   - Users updated: ${updatedCount}`);
    console.log(`   - Users already up-to-date: ${snapshot.docs.length - updatedCount}`);
    
    if (updates.length > 0) {
      console.log(`\n📝 Detailed changes:`);
      updates.forEach(({ uid, changes }) => {
        console.log(`   - ${uid}: added ${changes.join(', ')}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during backfill process:', error);
    process.exit(1);
  }
}

// Run the backfill if this script is executed directly
if (require.main === module) {
  console.log('⚠️  WARNING: This script modifies your Firestore database!');
  console.log('⚠️  Make sure you are running this in a development environment.');
  console.log('⚠️  Do not run this in production without proper backup!');
  console.log('');
  
  // Add a small delay to allow reading the warning
  setTimeout(() => {
    backfillUsers()
      .then(() => {
        console.log('\n✅ Backfill script completed successfully');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n❌ Backfill script failed:', error);
        process.exit(1);
      });
  }, 2000);
}

export { backfillUsers };
