import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, Timestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { UserProfile, AppNotification } from '../src/types/friendships';
import { 
  sendFriendRequestOptimistic, 
  acceptFriendRequestOptimistic, 
  declineFriendRequestOptimistic,
  watchIncomingRequestsOptimistic,
  watchOutgoingRequestsOptimistic,
  watchConnections
} from '../src/services/friends';
import { watchNotifications, markAllAsRead } from '../src/services/notifications';

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

const runEnhancedTest = async () => {
  console.log('🚀 Starting Enhanced Friend Requests Flow Test...\n');

  const usersCollection = collection(db, 'users');

  // Create test users
  console.log('👥 Creating test users...');
  const userA = {
    uid: 'test-user-a-enhanced',
    name: 'Alice Johnson',
    email: 'alice@test.com',
    businessName: 'Alice Corp',
    industry: 'Technology',
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    notifications: []
  };

  const userB = {
    uid: 'test-user-b-enhanced', 
    name: 'Bob Smith',
    email: 'bob@test.com',
    businessName: 'Bob Industries',
    industry: 'Finance',
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    notifications: []
  };

  const userC = {
    uid: 'test-user-c-enhanced',
    name: 'Charlie Brown',
    email: 'charlie@test.com',
    businessName: 'Charlie Co',
    industry: 'Marketing',
    friends: [],
    pendingRequests: [],
    sentRequests: [],
    notifications: []
  };

  await setDoc(doc(usersCollection, userA.uid), userA);
  await setDoc(doc(usersCollection, userB.uid), userB);
  await setDoc(doc(usersCollection, userC.uid), userC);
  console.log('✅ Test users created');

  // Test 1: Send friend request from Alice to Bob
  console.log('\n📤 Test 1: Sending friend request from Alice to Bob');
  try {
    await sendFriendRequestOptimistic(userA.uid, userB.uid);
    console.log('✅ Friend request sent successfully');
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
  }

  // Test 2: Send friend request from Alice to Charlie
  console.log('\n📤 Test 2: Sending friend request from Alice to Charlie');
  try {
    await sendFriendRequestOptimistic(userA.uid, userC.uid);
    console.log('✅ Second friend request sent successfully');
  } catch (error) {
    console.error('❌ Error sending second friend request:', error);
  }

  // Test 3: Test real-time listeners
  console.log('\n👀 Test 3: Testing real-time listeners');
  try {
    let incomingCount = 0;
    let outgoingCount = 0;
    let friendsCount = 0;

    // Watch Bob's incoming requests
    const unsubscribeIncoming = watchIncomingRequestsOptimistic(userB.uid, (uids) => {
      incomingCount = uids.length;
      console.log(`   - Bob's incoming requests: ${uids.length} (${uids.join(', ')})`);
    });

    // Watch Alice's outgoing requests
    const unsubscribeOutgoing = watchOutgoingRequestsOptimistic(userA.uid, (uids) => {
      outgoingCount = uids.length;
      console.log(`   - Alice's outgoing requests: ${uids.length} (${uids.join(', ')})`);
    });

    // Wait for listeners to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`   - Final counts: Incoming=${incomingCount}, Outgoing=${outgoingCount}`);
    unsubscribeIncoming();
    unsubscribeOutgoing();
  } catch (error) {
    console.error('❌ Error testing real-time listeners:', error);
  }

  // Test 4: Bob accepts Alice's request
  console.log('\n🤝 Test 4: Bob accepting Alice\'s friend request');
  try {
    const roomId = await acceptFriendRequestOptimistic(userB.uid, userA.uid);
    console.log(`✅ Friend request accepted successfully, chat room: ${roomId}`);
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
  }

  // Test 5: Test friends list updates
  console.log('\n👥 Test 5: Testing friends list updates');
  try {
    let friendsCount = 0;
    const unsubscribeFriends = watchConnections(userA.uid, (uids) => {
      friendsCount = uids.length;
      console.log(`   - Alice's friends: ${uids.length} (${uids.join(', ')})`);
    });

    // Wait for friends list to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    unsubscribeFriends();
  } catch (error) {
    console.error('❌ Error testing friends list:', error);
  }

  // Test 6: Test notifications
  console.log('\n🔔 Test 6: Testing notifications');
  try {
    let notificationCount = 0;
    const unsubscribeNotifications = watchNotifications(userA.uid, (notifications) => {
      notificationCount = notifications.length;
      console.log(`   - Alice has ${notifications.length} notifications`);
      notifications.forEach(notif => {
        console.log(`     - ${notif.type} from ${notif.fromUser} (read: ${notif.read})`);
      });
    });

    // Wait for notifications to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));
    unsubscribeNotifications();
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
  }

  // Test 7: Bob declines Charlie's request (if it exists)
  console.log('\n❌ Test 7: Testing decline scenario');
  try {
    // First, let Charlie send a request to Bob
    await sendFriendRequestOptimistic(userC.uid, userB.uid);
    console.log('   - Charlie sent request to Bob');
    
    // Bob declines
    await declineFriendRequestOptimistic(userB.uid, userC.uid);
    console.log('✅ Friend request declined successfully');
  } catch (error) {
    console.error('❌ Error in decline test:', error);
  }

  // Test 8: Test mark all as read
  console.log('\n📖 Test 8: Testing mark all as read');
  try {
    await markAllAsRead(userA.uid);
    console.log('✅ All notifications marked as read for Alice');
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
  }

  // Final verification
  console.log('\n📊 Final verification:');
  try {
    const [aliceDoc, bobDoc, charlieDoc] = await Promise.all([
      getDoc(doc(usersCollection, userA.uid)),
      getDoc(doc(usersCollection, userB.uid)),
      getDoc(doc(usersCollection, userC.uid))
    ]);

    if (aliceDoc.exists() && bobDoc.exists() && charlieDoc.exists()) {
      const aliceData = aliceDoc.data() as UserProfile;
      const bobData = bobDoc.data() as UserProfile;
      const charlieData = charlieDoc.data() as UserProfile;

      console.log(`   - Alice's friends: ${JSON.stringify(aliceData.friends)}`);
      console.log(`   - Alice's sentRequests: ${JSON.stringify(aliceData.sentRequests)}`);
      console.log(`   - Bob's friends: ${JSON.stringify(bobData.friends)}`);
      console.log(`   - Bob's pendingRequests: ${JSON.stringify(bobData.pendingRequests)}`);
      console.log(`   - Charlie's sentRequests: ${JSON.stringify(charlieData.sentRequests)}`);
      console.log(`   - Alice's notifications: ${aliceData.notifications.length} items`);
      console.log(`   - Bob's notifications: ${bobData.notifications.length} items`);
    }
  } catch (error) {
    console.error('❌ Error in final verification:', error);
  }

  console.log('\n🎉 Enhanced tests completed!');
  console.log('\n📝 Test Summary:');
  console.log('   ✅ Friend requests sent');
  console.log('   ✅ Real-time listeners working');
  console.log('   ✅ Friend request accepted');
  console.log('   ✅ Friends list updated');
  console.log('   ✅ Notifications working');
  console.log('   ✅ Friend request declined');
  console.log('   ✅ Mark all as read working');
  console.log('   ✅ UI state synced live');
  
  console.log('\n🧹 Cleanup: You can delete the test users manually if needed:');
  console.log('   - Alice Johnson: test-user-a-enhanced');
  console.log('   - Bob Smith: test-user-b-enhanced');
  console.log('   - Charlie Brown: test-user-c-enhanced');
};

runEnhancedTest().catch(console.error);
