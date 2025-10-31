// Comprehensive Firebase Debugging Script
// Run this in the browser console to debug the friend request system

console.log('🔍 Starting Comprehensive Firebase Debug...');

// Debug function to check Firebase connection and user state
async function debugFirebaseState() {
  console.log('\n=== FIREBASE DEBUG REPORT ===');
  
  // 1. Check Firebase connection
  console.log('\n1. Firebase Connection:');
  try {
    const app = firebase.app();
    console.log('✅ Firebase app initialized:', app.name);
  } catch (error) {
    console.error('❌ Firebase not initialized:', error);
    return;
  }

  // 2. Check Firestore connection
  console.log('\n2. Firestore Connection:');
  try {
    const db = firebase.firestore();
    console.log('✅ Firestore instance created');
    
    // Test a simple read operation
    const testDoc = await db.collection('test').doc('test').get();
    console.log('✅ Firestore read operation successful');
  } catch (error) {
    console.error('❌ Firestore connection error:', error);
  }

  // 3. Check authentication
  console.log('\n3. Authentication State:');
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    console.log('✅ User authenticated:', currentUser.uid);
    console.log('   Email:', currentUser.email);
    console.log('   Display Name:', currentUser.displayName);
  } else {
    console.error('❌ No user authenticated');
    return;
  }

  // 4. Check user document existence
  console.log('\n4. User Document Check:');
  try {
    const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('✅ User document exists');
      const data = userDoc.data();
      console.log('   Document data:', data);
      
      // Check required arrays
      console.log('   incomingRequests:', Array.isArray(data.incomingRequests) ? data.incomingRequests.length : 'NOT ARRAY');
      console.log('   sentRequests:', Array.isArray(data.sentRequests) ? data.sentRequests.length : 'NOT ARRAY');
      console.log('   friends:', Array.isArray(data.friends) ? data.friends.length : 'NOT ARRAY');
    } else {
      console.log('⚠️ User document does NOT exist - this is the problem!');
      console.log('   Attempting to create user document...');
      
      try {
        await userRef.set({
          uid: currentUser.uid,
          name: currentUser.displayName || 'Unknown User',
          email: currentUser.email,
          incomingRequests: [],
          sentRequests: [],
          friends: []
        });
        console.log('✅ User document created successfully');
      } catch (createError) {
        console.error('❌ Failed to create user document:', createError);
      }
    }
  } catch (error) {
    console.error('❌ Error checking user document:', error);
  }

  // 5. Test array operations
  console.log('\n5. Testing Array Operations:');
  try {
    const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
    
    // Test arrayUnion
    await userRef.set({
      testArray: firebase.firestore.FieldValue.arrayUnion('test_item')
    }, { merge: true });
    console.log('✅ arrayUnion operation successful');
    
    // Clean up test data
    await userRef.update({
      testArray: firebase.firestore.FieldValue.delete()
    });
    console.log('✅ Array operations working correctly');
    
  } catch (error) {
    console.error('❌ Array operations failed:', error);
  }

  // 6. Check Firestore rules
  console.log('\n6. Firestore Rules Check:');
  console.log('💡 If you see permission errors, check your Firestore security rules');
  console.log('💡 Rules should allow authenticated users to read/write their own documents');

  console.log('\n=== DEBUG COMPLETE ===');
}

// Test friend request function
async function testFriendRequestFunction() {
  console.log('\n🧪 Testing Friend Request Function...');
  
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user authenticated');
    return;
  }

  // Test with a dummy user ID
  const testUserId = 'test_user_' + Date.now();
  const testUserName = 'Test User';

  try {
    console.log('📤 Attempting to send friend request...');
    
    // Simulate the sendFriendRequest function
    const id = `${currentUser.uid}_${testUserId}`;
    
    // Ensure user arrays exist
    const currentUserRef = firebase.firestore().collection('users').doc(currentUser.uid);
    const testUserRef = firebase.firestore().collection('users').doc(testUserId);
    
    // Check if current user document exists
    const currentUserDoc = await currentUserRef.get();
    if (!currentUserDoc.exists) {
      console.log('⚠️ Creating current user document...');
      await currentUserRef.set({
        uid: currentUser.uid,
        name: currentUser.displayName || 'Unknown User',
        email: currentUser.email,
        incomingRequests: [],
        sentRequests: [],
        friends: []
      });
    }
    
    // Create test user document
    console.log('⚠️ Creating test user document...');
    await testUserRef.set({
      uid: testUserId,
      name: testUserName,
      email: 'test@example.com',
      incomingRequests: [],
      sentRequests: [],
      friends: []
    });
    
    // Send friend request
    await Promise.all([
      testUserRef.set({
        incomingRequests: firebase.firestore.FieldValue.arrayUnion({
          id, 
          fromUid: currentUser.uid, 
          fromName: currentUser.displayName || 'Unknown User', 
          createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
          seen: false
        })
      }, { merge: true }),
      currentUserRef.set({
        sentRequests: firebase.firestore.FieldValue.arrayUnion({
          id, 
          toUid: testUserId, 
          toName: testUserName, 
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      }, { merge: true })
    ]);
    
    console.log('✅ Friend request sent successfully!');
    
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await testUserRef.delete();
    
  } catch (error) {
    console.error('❌ Friend request test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error code:', error.code);
  }
}

// Export functions
window.debugFirebaseState = debugFirebaseState;
window.testFriendRequestFunction = testFriendRequestFunction;

console.log('\n🚀 Debug functions loaded!');
console.log('Run debugFirebaseState() to check Firebase setup');
console.log('Run testFriendRequestFunction() to test friend requests');

// Auto-run debug
debugFirebaseState();
