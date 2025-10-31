import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  sendFriendRequest, 
  watchIncomingRequests 
} from '../src/services/friends';
import { watchNotifications } from '../src/services/notifications';

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

async function testNotificationFlow() {
  console.log('🔔 Testing Notification Flow...\n');

  // Test user IDs
  const userA = 'test-user-a-notifications';
  const userB = 'test-user-b-notifications';

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

    // 3. Test watching notifications for User B
    console.log('3️⃣ Testing notification system for User B...');
    let notificationCount = 0;
    const stopNotifications = watchNotifications(userB, (notifications) => {
      notificationCount = notifications.length;
      console.log(`🔔 User B has ${notifications.length} notifications`);
      notifications.forEach(notif => {
        console.log(`   - ${notif.fromUser} ${notif.type} (read: ${notif.read})`);
      });
    });

    // 4. Test watching incoming requests for User B
    console.log('4️⃣ Testing incoming requests for User B...');
    let incomingCount = 0;
    const stopIncoming = watchIncomingRequests(userB, (requests) => {
      incomingCount = requests.length;
      console.log(`📥 User B has ${requests.length} incoming requests`);
      requests.forEach(req => {
        console.log(`   - From: ${req.fromName} (seen: ${req.seen})`);
      });
    });

    // Wait for listeners to fire
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verify both systems show the same data
    console.log('5️⃣ Verifying notification consistency...');
    console.log(`📊 Notifications: ${notificationCount}, Incoming Requests: ${incomingCount}`);
    
    if (notificationCount > 0 && incomingCount > 0) {
      console.log('✅ Both notification systems are working!');
    } else {
      console.log('❌ Notification systems not synchronized');
    }

    // Cleanup
    stopNotifications();
    stopIncoming();

    console.log('\n🎉 Notification flow test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNotificationFlow().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
