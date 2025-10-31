// Test script to verify the Firebase error fix
// Run this in the browser console after logging in

console.log('🧪 Testing Firebase Error Fix...');

// Test function to create a user document if it doesn't exist
async function testUserDocumentCreation() {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    console.error('❌ No user logged in');
    return;
  }

  console.log(`✅ Testing with user: ${currentUser.uid}`);

  try {
    // Test 1: Check if user document exists
    const userRef = firebase.firestore().collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('✅ User document exists');
      console.log('Current data:', userDoc.data());
    } else {
      console.log('⚠️ User document does not exist - this was causing the error');
      
      // Test 2: Create user document with setDoc
      await firebase.firestore().collection('users').doc(currentUser.uid).set({
        uid: currentUser.uid,
        name: currentUser.displayName || 'Test User',
        email: currentUser.email,
        incomingRequests: [],
        sentRequests: [],
        friends: []
      }, { merge: true });
      
      console.log('✅ User document created successfully');
    }

    // Test 3: Try to update arrays (this should work now)
    await firebase.firestore().collection('users').doc(currentUser.uid).set({
      incomingRequests: firebase.firestore.FieldValue.arrayUnion({
        id: 'test_request',
        fromUid: 'test_user',
        fromName: 'Test Sender',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        seen: false
      })
    }, { merge: true });
    
    console.log('✅ Array update successful - no more Firebase errors!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Export for manual testing
window.testUserDocumentCreation = testUserDocumentCreation;

console.log('🚀 Test function loaded! Run testUserDocumentCreation() to test the fix');

// Auto-run test
testUserDocumentCreation();
