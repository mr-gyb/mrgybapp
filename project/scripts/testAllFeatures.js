// Comprehensive Test Script for Friend Request System
// Run this in the browser console to test all features

console.log('🧪 Starting Comprehensive Friend Request System Test...');

// Test function to verify notification counter
async function testNotificationCounter() {
  console.log('\n📊 Testing Notification Counter...');
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user logged in');
    return;
  }

  try {
    // Check if the counter hook is working
    console.log('✅ User authenticated:', currentUser.uid);
    
    // Test sending a friend request to see if counter updates
    const testUserId = 'test_counter_' + Date.now();
    const testUserName = 'Counter Test User';
    
    console.log('📤 Sending test friend request...');
    
    // Simulate friend request
    const id = `${currentUser.uid}_${testUserId}`;
    const requestData = {
      id, 
      fromUid: currentUser.uid, 
      fromName: currentUser.displayName || 'Current User', 
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
      seen: false
    };
    
    // Create test user and send request
    await firebase.firestore().collection('users').doc(testUserId).set({
      uid: testUserId,
      name: testUserName,
      email: 'test@example.com',
      incomingRequests: [requestData],
      sentRequests: [],
      friends: []
    });
    
    await firebase.firestore().collection('users').doc(currentUser.uid).set({
      sentRequests: [{
        id, 
        toUid: testUserId, 
        toName: testUserName, 
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }]
    }, { merge: true });
    
    console.log('✅ Test friend request sent');
    console.log('💡 Check if notification counter shows "1" in the UI');
    
    // Clean up
    setTimeout(async () => {
      await firebase.firestore().collection('users').doc(testUserId).delete();
      console.log('🧹 Test data cleaned up');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Notification counter test failed:', error);
  }
}

// Test function to verify chat list filtering
async function testChatListFiltering() {
  console.log('\n💬 Testing Chat List Filtering...');
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user logged in');
    return;
  }

  try {
    // Check current chat rooms
    const chatRoomsSnapshot = await firebase.firestore().collection('chatRooms').get();
    console.log(`📋 Found ${chatRoomsSnapshot.size} chat rooms total`);
    
    // Filter rooms where user is a member
    const userChats = chatRoomsSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.members && data.members.includes(currentUser.uid);
    });
    
    console.log(`✅ User is a member of ${userChats.length} chat rooms`);
    
    // Check for archived chats
    const archivedChats = userChats.filter(doc => {
      const data = doc.data();
      return data.archivedBy && data.archivedBy[currentUser.uid];
    });
    
    console.log(`📦 User has ${archivedChats.length} archived chats`);
    console.log(`💬 User has ${userChats.length - archivedChats.length} active chats`);
    
  } catch (error) {
    console.error('❌ Chat list filtering test failed:', error);
  }
}

// Test function to verify archive/delete functionality
async function testArchiveDeleteFunctionality() {
  console.log('\n🗂️ Testing Archive/Delete Functionality...');
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user logged in');
    return;
  }

  try {
    // Create a test chat room
    const testChatId = 'test_chat_' + Date.now();
    const testChatData = {
      members: [currentUser.uid, 'test_member'],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: null,
      pairKey: `${currentUser.uid}_test_member`,
      canHardDelete: [currentUser.uid, 'test_member'],
      archivedBy: {}
    };
    
    console.log('📝 Creating test chat room...');
    await firebase.firestore().collection('chatRooms').doc(testChatId).set(testChatData);
    
    // Test archiving
    console.log('📦 Testing archive functionality...');
    await firebase.firestore().collection('chatRooms').doc(testChatId).set({
      archivedBy: { [currentUser.uid]: true }
    }, { merge: true });
    
    console.log('✅ Chat archived successfully');
    
    // Test unarchiving
    console.log('📂 Testing unarchive functionality...');
    await firebase.firestore().collection('chatRooms').doc(testChatId).set({
      archivedBy: {}
    }, { merge: true });
    
    console.log('✅ Chat unarchived successfully');
    
    // Test hard delete
    console.log('🗑️ Testing hard delete functionality...');
    await firebase.firestore().collection('chatRooms').doc(testChatId).delete();
    
    console.log('✅ Chat permanently deleted');
    
  } catch (error) {
    console.error('❌ Archive/delete test failed:', error);
  }
}

// Test function to verify mark as seen functionality
async function testMarkAsSeen() {
  console.log('\n👁️ Testing Mark as Seen Functionality...');
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user logged in');
    return;
  }

  try {
    // Create test incoming requests
    const testRequest = {
      id: 'test_seen_' + Date.now(),
      fromUid: 'test_sender',
      fromName: 'Test Sender',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      seen: false
    };
    
    console.log('📝 Creating test incoming request...');
    await firebase.firestore().collection('users').doc(currentUser.uid).set({
      incomingRequests: [testRequest]
    }, { merge: true });
    
    console.log('✅ Test request created with seen: false');
    
    // Mark as seen
    console.log('👁️ Marking request as seen...');
    const updatedRequest = { ...testRequest, seen: true };
    await firebase.firestore().collection('users').doc(currentUser.uid).set({
      incomingRequests: [updatedRequest]
    }, { merge: true });
    
    console.log('✅ Request marked as seen');
    console.log('💡 Notification counter should now show 0');
    
  } catch (error) {
    console.error('❌ Mark as seen test failed:', error);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Running All Tests...');
  
  await testNotificationCounter();
  await testChatListFiltering();
  await testArchiveDeleteFunctionality();
  await testMarkAsSeen();
  
  console.log('\n🎉 All tests completed!');
  console.log('💡 Check the UI to verify:');
  console.log('   - Notification counter shows correct count');
  console.log('   - Chat list only shows active chats');
  console.log('   - Archive/delete buttons work');
  console.log('   - Mark as seen resets counter to 0');
}

// Export functions for manual testing
window.testNotificationCounter = testNotificationCounter;
window.testChatListFiltering = testChatListFiltering;
window.testArchiveDeleteFunctionality = testArchiveDeleteFunctionality;
window.testMarkAsSeen = testMarkAsSeen;
window.runAllTests = runAllTests;

console.log('\n🚀 Test functions loaded!');
console.log('Run runAllTests() to test all features');
console.log('Or run individual tests: testNotificationCounter(), testChatListFiltering(), etc.');

// Auto-run tests
runAllTests();
