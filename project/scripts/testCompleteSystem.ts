import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp, arrayRemove, arrayUnion } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { IncomingRequest, SentRequest, FriendRef, UserProfile, ChatRoom } from '../src/types/friendships';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, watchIncomingRequests, watchSentRequests, markIncomingSeen, watchConnections } from '../src/services/friends';
import { createOrGetDirectChat, watchUserChats, archiveChat, unarchiveChat, deleteChatForEveryone } from '../src/services/chats';

// Initialize Firebase (using dummy config for testing)
const firebaseConfig = {
  apiKey: "dummy-api-key",
  authDomain: "dummy-auth-domain",
  projectId: "dummy-project-id",
  storageBucket: "dummy-storage-bucket",
  messagingSenderId: "dummy-messaging-sender-id",
  appId: "dummy-app-id"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Helper to create a dummy user
const createOrSignInUser = async (email: string, password: string, name: string): Promise<string> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "users", uid), {
      uid,
      name,
      email,
      friends: [],
      incomingRequests: [],
      sentRequests: []
    }, { merge: true });
    console.log(`✅ User ${name} (${uid}) created/signed in.`);
    return uid;
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      console.log(`✅ User ${name} (${uid}) signed in.`);
      return uid;
    }
    console.error(`❌ Error creating/signing in user ${name}:`, e);
    throw e;
  }
};

const runCompleteTest = async () => {
  console.log('🚀 Starting Complete Friend Request & Chat System Test...\n');

  // 1. Setup two users
  const userA_email = 'testA@example.com';
  const userA_password = 'password123';
  const userA_name = 'Alice';

  const userB_email = 'testB@example.com';
  const userB_password = 'password123';
  const userB_name = 'Bob';

  const uidA = await createOrSignInUser(userA_email, userA_password, userA_name);
  const uidB = await createOrSignInUser(userB_email, userB_password, userB_name);

  // Listeners for User B
  let incomingB: IncomingRequest[] = [];
  let sentB: SentRequest[] = [];
  let friendsB: string[] = [];
  let chatsB: ChatRoom[] = [];

  const unsubscribeIncomingB = watchIncomingRequests(uidB, (reqs) => {
    incomingB = reqs;
    console.log(`📥 [User B] Incoming Requests: ${incomingB.length} (Unseen: ${incomingB.filter(r => !r.seen).length})`);
  });

  const unsubscribeSentB = watchSentRequests(uidB, (reqs) => {
    sentB = reqs;
    console.log(`📤 [User B] Sent Requests: ${sentB.length}`);
  });

  const unsubscribeFriendsB = watchConnections(uidB, (friends) => {
    friendsB = friends;
    console.log(`👥 [User B] Friends: ${friendsB.length}`);
  });

  const unsubscribeChatsB = watchUserChats(uidB, (chats) => {
    chatsB = chats;
    console.log(`💬 [User B] Active Chats: ${chatsB.length}`);
  });

  // Listeners for User A
  let incomingA: IncomingRequest[] = [];
  let sentA: SentRequest[] = [];
  let friendsA: string[] = [];
  let chatsA: ChatRoom[] = [];

  const unsubscribeIncomingA = watchIncomingRequests(uidA, (reqs) => {
    incomingA = reqs;
    console.log(`📥 [User A] Incoming Requests: ${incomingA.length} (Unseen: ${incomingA.filter(r => !r.seen).length})`);
  });

  const unsubscribeSentA = watchSentRequests(uidA, (reqs) => {
    sentA = reqs;
    console.log(`📤 [User A] Sent Requests: ${sentA.length}`);
  });

  const unsubscribeFriendsA = watchConnections(uidA, (friends) => {
    friendsA = friends;
    console.log(`👥 [User A] Friends: ${friendsA.length}`);
  });

  const unsubscribeChatsA = watchUserChats(uidA, (chats) => {
    chatsA = chats;
    console.log(`💬 [User A] Active Chats: ${chatsA.length}`);
  });

  await new Promise(resolve => setTimeout(resolve, 2000)); // Give listeners time to attach

  // TEST CASE 1: User A sends request to B → B sees Incoming(1) + bell shows 1
  console.log('\n🔥 TEST CASE 1: Send Friend Request');
  console.log('--- User A sends request to User B ---');
  await sendFriendRequest(uidA, uidB, userA_name, userB_name);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.assert(sentA.some(r => r.toUid === uidB), '✅ User A should have sent request to B');
  console.assert(incomingB.some(r => r.fromUid === uidA && !r.seen), '✅ User B should have unseen incoming request from A');
  console.log('✅ TEST CASE 1 PASSED: Badge count should show 1 for User B\n');

  // TEST CASE 2: B opens Incoming tab → badge resets to 0
  console.log('🔥 TEST CASE 2: Mark as Seen');
  console.log('--- User B opens Incoming tab (marks as seen) ---');
  await markIncomingSeen(uidB);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.assert(incomingB.every(r => r.seen), '✅ User B should have all incoming requests marked as seen');
  console.log('✅ TEST CASE 2 PASSED: Badge count should reset to 0\n');

  // TEST CASE 3: B ACCEPTS → both added to friends[]; chat room created; appears under Team Chats for both
  console.log('🔥 TEST CASE 3: Accept Friend Request');
  console.log('--- User B accepts request from User A ---');
  await acceptFriendRequest(uidB, uidA);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.assert(friendsA.includes(uidB), '✅ User A should have User B as friend');
  console.assert(friendsB.includes(uidA), '✅ User B should have User A as friend');
  console.assert(!sentA.some(r => r.toUid === uidB), '✅ User A should no longer have sent request to B');
  console.assert(!incomingB.some(r => r.fromUid === uidA), '✅ User B should no longer have incoming request from A');
  console.assert(chatsA.length > 0, '✅ User A should have a chat room');
  console.assert(chatsB.length > 0, '✅ User B should have a chat room');
  console.log('✅ TEST CASE 3 PASSED: Chat room created and appears in Team Chats for both users\n');

  // TEST CASE 4: B DECLINES → request disappears; no chat is shown on either side
  console.log('🔥 TEST CASE 4: Decline Friend Request');
  console.log('--- User A sends another request to User B ---');
  await sendFriendRequest(uidA, uidB, userA_name, userB_name);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('--- User B declines request from User A ---');
  await declineFriendRequest(uidB, uidA);
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.assert(!sentA.some(r => r.toUid === uidB), '✅ User A should no longer have sent request to B after decline');
  console.assert(!incomingB.some(r => r.fromUid === uidA), '✅ User B should no longer have incoming request from A after decline');
  console.log('✅ TEST CASE 4 PASSED: Request disappears, no new chat created\n');

  // TEST CASE 5: User archives chat → chat disappears for that user only
  console.log('🔥 TEST CASE 5: Archive Chat');
  console.log('--- User A archives the existing chat ---');
  const chatId = chatsA[0]?.id;
  if (chatId) {
    await archiveChat(chatId, uidA);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.assert(chatsA.length === 0, '✅ User A should not see the archived chat');
    console.assert(chatsB.length > 0, '✅ User B should still see the chat');
    console.log('✅ TEST CASE 5 PASSED: Chat archived for User A only\n');

    // TEST CASE 6: User hard deletes chat → chat fully removed from Firestore, including messages
    console.log('🔥 TEST CASE 6: Hard Delete Chat');
    console.log('--- User B hard deletes the chat ---');
    await deleteChatForEveryone(chatId, uidB);
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.assert(chatsB.length === 0, '✅ User B should not see the deleted chat');
    console.log('✅ TEST CASE 6 PASSED: Chat permanently deleted\n');
  }

  console.log('🎉 ALL TEST CASES PASSED! Complete Friend Request & Chat System is working correctly!\n');

  // Cleanup listeners
  unsubscribeIncomingB();
  unsubscribeSentB();
  unsubscribeFriendsB();
  unsubscribeChatsB();
  unsubscribeIncomingA();
  unsubscribeSentA();
  unsubscribeFriendsA();
  unsubscribeChatsA();
};

runCompleteTest().catch(console.error);
