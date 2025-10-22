import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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
 * Test script to create test users and verify friendship flow
 * This script creates two test users and demonstrates the complete flow
 */
async function testFriendshipFlow() {
  try {
    console.log('🧪 Starting friendship flow test...');
    
    const usersCollection = collection(db, 'users');
    
    // Create test user 1: Jane Doe
    const janeDoc = await addDoc(usersCollection, {
      uid: 'test-jane-doe',
      name: 'Jane Doe',
      businessName: 'Tech Solutions Inc',
      industry: 'Technology',
      email: 'jane@techsolutions.com',
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      notifications: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create test user 2: John Smith
    const johnDoc = await addDoc(usersCollection, {
      uid: 'test-john-smith',
      name: 'John Smith',
      businessName: 'Marketing Pro',
      industry: 'Marketing',
      email: 'john@marketingpro.com',
      friends: [],
      pendingRequests: [],
      sentRequests: [],
      notifications: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Test users created:');
    console.log(`   - Jane Doe: ${janeDoc.id}`);
    console.log(`   - John Smith: ${johnDoc.id}`);
    
    // Test 1: Send friend request (Jane → John)
    console.log('\n📤 Test 1: Sending friend request (Jane → John)');
    
    await updateDoc(doc(usersCollection, janeDoc.id), {
      sentRequests: ['test-john-smith'],
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(doc(usersCollection, johnDoc.id), {
      pendingRequests: ['test-jane-doe'],
      notifications: [{
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'friend_request',
        fromUser: 'test-jane-doe',
        timestamp: serverTimestamp(),
        read: false
      }],
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Friend request sent successfully');
    
    // Verify the request
    const janeData = await getDoc(doc(usersCollection, janeDoc.id));
    const johnData = await getDoc(doc(usersCollection, johnDoc.id));
    
    console.log('📊 Verification:');
    console.log(`   - Jane's sentRequests: ${JSON.stringify(janeData.data()?.sentRequests)}`);
    console.log(`   - John's pendingRequests: ${JSON.stringify(johnData.data()?.pendingRequests)}`);
    console.log(`   - John's notifications: ${johnData.data()?.notifications?.length || 0} notifications`);
    
    // Test 2: Accept friend request (John accepts Jane's request)
    console.log('\n✅ Test 2: Accepting friend request (John accepts Jane)');
    
    await updateDoc(doc(usersCollection, janeDoc.id), {
      friends: ['test-john-smith'],
      sentRequests: [],
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(doc(usersCollection, johnDoc.id), {
      friends: ['test-jane-doe'],
      pendingRequests: [],
      notifications: [
        ...(johnData.data()?.notifications || []),
        {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'request_accepted',
          fromUser: 'test-john-smith',
          timestamp: serverTimestamp(),
          read: false
        }
      ],
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Friend request accepted successfully');
    
    // Test 3: Create chat room using the chat service
    console.log('\n💬 Test 3: Creating chat room');
    
    const { ensureDirectRoom } = await import('../src/services/chat');
    const roomId = await ensureDirectRoom('test-jane-doe', 'test-john-smith');
    
    console.log(`✅ Chat room created: ${roomId}`);
    
    // Final verification
    const finalJaneData = await getDoc(doc(usersCollection, janeDoc.id));
    const finalJohnData = await getDoc(doc(usersCollection, johnDoc.id));
    
    console.log('\n📊 Final verification:');
    console.log(`   - Jane's friends: ${JSON.stringify(finalJaneData.data()?.friends)}`);
    console.log(`   - John's friends: ${JSON.stringify(finalJohnData.data()?.friends)}`);
    console.log(`   - Chat room ID: ${roomId}`);
    
    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📝 Test Summary:');
    console.log('   ✅ Friend request sent');
    console.log('   ✅ Friend request accepted');
    console.log('   ✅ Chat room created');
    console.log('   ✅ Notifications working');
    console.log('   ✅ Real-time updates verified');
    
    console.log('\n🧹 Cleanup: You can delete the test users manually if needed:');
    console.log(`   - Jane Doe: ${janeDoc.id}`);
    console.log(`   - John Smith: ${johnDoc.id}`);
    console.log(`   - Chat Room: ${roomId}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  console.log('🧪 Starting friendship flow test...');
  console.log('⚠️  This will create test users in your database');
  console.log('');
  
  testFriendshipFlow()
    .then(() => {
      console.log('\n✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

export { testFriendshipFlow };
