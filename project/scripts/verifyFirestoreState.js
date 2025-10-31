// Firestore State Verification Script
// Run this in the browser console while logged into your app

console.log('🔍 Starting Firestore State Verification...');

// Get current user
const currentUser = firebase.auth().currentUser;
if (!currentUser) {
  console.error('❌ No user logged in. Please log in first.');
} else {
  console.log(`✅ Current user: ${currentUser.uid}`);
}

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

// Main verification function
async function verifyFirestoreState() {
  console.log('\n🔍 VERIFYING CURRENT FIRESTORE STATE...');
  
  // Check current user's document
  const currentUserData = await checkUserDocument(currentUser.uid, 'Current User');
  
  // Check chat rooms
  const chatRooms = await checkChatRooms();
  
  console.log('\n📋 VERIFICATION SUMMARY:');
  console.log('✅ User documents checked');
  console.log('✅ Chat rooms checked');
  console.log('\n💡 To test the flow:');
  console.log('1. Send a friend request to another user');
  console.log('2. Run verifyFirestoreState() again to see incomingRequests/sentRequests');
  console.log('3. Accept/decline the request');
  console.log('4. Run verifyFirestoreState() again to see the final state');
}

// Export functions for manual testing
window.verifyFirestoreState = verifyFirestoreState;
window.checkUserDocument = checkUserDocument;
window.checkChatRooms = checkChatRooms;

console.log('\n🚀 Verification functions loaded!');
console.log('Run verifyFirestoreState() to check current state');
console.log('Run checkUserDocument("USER_ID", "Label") to check specific user');
console.log('Run checkChatRooms() to check all chat rooms');

// Auto-run verification
verifyFirestoreState();
