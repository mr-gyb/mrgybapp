import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  declineFriendRequest, 
  watchIncomingRequests, 
  watchSentRequests,
  markIncomingSeen 
} from '../src/services/friends';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFriendRequestFlow() {
  console.log('🧪 Testing Friend Request Flow...\n');

  // Test user IDs
  const userA = 'test-user-a';
  const userB = 'test-user-b';

  try {
    // 1. Setup test users
    console.log('1️⃣ Setting up test users...');
    await setDoc(doc(db, 'users', userA), {
      name: 'User A',
      email: 'usera@test.com',
      incomingRequests: [],
      sentRequests: [],
      friends: []
    });
    
    await setDoc(doc(db, 'users', userB), {
      name: 'User B', 
      email: 'userb@test.com',
      incomingRequests: [],
      sentRequests: [],
      friends: []
    });
    console.log('✅ Test users created\n');

    // 2. Test sending friend request
    console.log('2️⃣ Testing send friend request...');
    await sendFriendRequest(userA, userB, 'User A', 'User B');
    console.log('✅ Friend request sent from User A to User B\n');

    // 3. Test watching incoming requests
    console.log('3️⃣ Testing watch incoming requests...');
    let incomingCount = 0;
    const stopIncoming = watchIncomingRequests(userB, (requests) => {
      incomingCount = requests.length;
      console.log(`📥 User B has ${requests.length} incoming requests`);
      requests.forEach(req => {
        console.log(`   - From: ${req.fromName} (${req.fromUid})`);
        console.log(`   - Seen: ${req.seen}`);
      });
    });

    // 4. Test watching sent requests
    console.log('4️⃣ Testing watch sent requests...');
    let sentCount = 0;
    const stopSent = watchSentRequests(userA, (requests) => {
      sentCount = requests.length;
      console.log(`📤 User A has ${requests.length} sent requests`);
      requests.forEach(req => {
        console.log(`   - To: ${req.toName} (${req.toUid})`);
      });
    });

    // Wait a moment for listeners to fire
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Test marking as seen
    console.log('5️⃣ Testing mark as seen...');
    await markIncomingSeen(userB);
    console.log('✅ Incoming requests marked as seen\n');

    // 6. Test accepting friend request
    console.log('6️⃣ Testing accept friend request...');
    await acceptFriendRequest(userB, userA);
    console.log('✅ Friend request accepted\n');

    // Wait for listeners to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 7. Verify final state
    console.log('7️⃣ Verifying final state...');
    const userADoc = await getDoc(doc(db, 'users', userA));
    const userBDoc = await getDoc(doc(db, 'users', userB));
    
    const userAData = userADoc.data();
    const userBData = userBDoc.data();
    
    console.log('User A friends:', userAData?.friends?.length || 0);
    console.log('User B friends:', userBData?.friends?.length || 0);
    console.log('User A sent requests:', userAData?.sentRequests?.length || 0);
    console.log('User B incoming requests:', userBData?.incomingRequests?.length || 0);

    // Cleanup
    stopIncoming();
    stopSent();

    console.log('\n🎉 Friend request flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFriendRequestFlow().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
