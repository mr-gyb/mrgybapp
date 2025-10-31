// Complete Firestore Flow Verification Script
// Run this in the browser console while logged into your app

console.log('🧪 Starting Complete Firestore Flow Verification...');

// Test user IDs (replace with actual user IDs from your app)
const USER_A_ID = 'userA'; // Replace with actual User A ID
const USER_B_ID = 'userB'; // Replace with actual User B ID

// Helper function to check user document
async function checkUserDocument(uid, label) {
  try {
    const userDoc = await firebase.firestore().collection('users').doc(uid).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      console.log(`\n📄 ${label} (${uid}):`);
      console.log('  friends:', data.friends || []);
      console.log('  incomingRequests:', data.incomingRequests || []);
      console.log('  sentRequests:', data.sentRequests || []);
      return data;
    } else {
      console.log(`❌ ${label} document not found`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error reading ${label}:`, error);
    return null;
  }
}

// Helper function to check chat rooms
async function checkChatRooms() {
  try {
    const chatRoomsSnapshot = await firebase.firestore().collection('chatRooms').get();
    console.log(`\n💬 Chat Rooms (${chatRoomsSnapshot.size} total):`);
    
    if (chatRoomsSnapshot.empty) {
      console.log('  No chat rooms found');
    } else {
      chatRoomsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  ${doc.id}: members=[${data.members.join(', ')}], pairKey=${data.pairKey}`);
      });
    }
    return chatRoomsSnapshot;
  } catch (error) {
    console.error('❌ Error reading chat rooms:', error);
    return null;
  }
}

// Test the complete flow
async function testCompleteFlow() {
  console.log('\n🧪 TESTING COMPLETE FRIEND REQUEST FLOW...');
  
  // Step 1: Check initial state
  console.log('\n📋 STEP 1: Initial State');
  const userA_initial = await checkUserDocument(USER_A_ID, 'User A (Initial)');
  const userB_initial = await checkUserDocument(USER_B_ID, 'User B (Initial)');
  const chatRooms_initial = await checkChatRooms();
  
  // Step 2: Simulate sending friend request
  console.log('\n📋 STEP 2: After User A sends request to User B');
  console.log('Expected:');
  console.log('  - User A: sentRequests should contain User B');
  console.log('  - User B: incomingRequests should contain User A');
  console.log('  - No chat rooms should be created');
  
  // Step 3: Simulate accepting request
  console.log('\n📋 STEP 3: After User B accepts request');
  console.log('Expected:');
  console.log('  - User A: friends should contain User B, sentRequests should be empty');
  console.log('  - User B: friends should contain User A, incomingRequests should be empty');
  console.log('  - One chat room should be created with members [User A, User B]');
  
  // Step 4: Simulate declining request
  console.log('\n📋 STEP 4: After User B declines request');
  console.log('Expected:');
  console.log('  - User A: sentRequests should be empty');
  console.log('  - User B: incomingRequests should be empty');
  console.log('  - No chat rooms should exist');
  
  console.log('\n💡 To test manually:');
  console.log('1. Use the FriendRequestsPanel to send a request');
  console.log('2. Run checkUserDocument("USER_ID", "Label") to verify state');
  console.log('3. Accept/decline the request');
  console.log('4. Run checkUserDocument again to verify final state');
}

// Export functions for manual testing
window.testCompleteFlow = testCompleteFlow;
window.checkUserDocument = checkUserDocument;
window.checkChatRooms = checkChatRooms;

console.log('\n🚀 Verification functions loaded!');
console.log('Run testCompleteFlow() to see expected behavior');
console.log('Run checkUserDocument("USER_ID", "Label") to check specific user');
console.log('Run checkChatRooms() to check all chat rooms');

// Auto-run test
testCompleteFlow();
