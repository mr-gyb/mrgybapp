// Simple Firebase Test - Run this in browser console
console.log('🔍 Simple Firebase Test');

// Test 1: Check if Firebase is available
console.log('\n1. Checking Firebase availability...');
if (typeof firebase === 'undefined') {
  console.error('❌ Firebase is not loaded! Check your Firebase configuration.');
} else {
  console.log('✅ Firebase is loaded');
}

// Test 2: Check current user
console.log('\n2. Checking authentication...');
const currentUser = firebase.auth().currentUser;
if (!currentUser) {
  console.error('❌ No user logged in. Please log in first.');
} else {
  console.log('✅ User logged in:', currentUser.uid);
}

// Test 3: Simple Firestore operation
console.log('\n3. Testing simple Firestore operation...');
async function testSimpleOperation() {
  try {
    const db = firebase.firestore();
    const testRef = db.collection('users').doc(currentUser.uid);
    
    // Try to read the document
    const doc = await testRef.get();
    console.log('✅ Document read successful');
    console.log('Document exists:', doc.exists);
    
    if (doc.exists) {
      console.log('Document data:', doc.data());
    } else {
      console.log('⚠️ Document does not exist - this is likely the issue!');
      
      // Try to create the document
      console.log('Attempting to create document...');
      await testRef.set({
        uid: currentUser.uid,
        name: currentUser.displayName || 'Unknown',
        email: currentUser.email,
        incomingRequests: [],
        sentRequests: [],
        friends: []
      });
      console.log('✅ Document created successfully');
    }
    
  } catch (error) {
    console.error('❌ Firestore operation failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Test 4: Test array operations
async function testArrayOperations() {
  console.log('\n4. Testing array operations...');
  try {
    const db = firebase.firestore();
    const testRef = db.collection('users').doc(currentUser.uid);
    
    // Test arrayUnion
    await testRef.set({
      testArray: firebase.firestore.FieldValue.arrayUnion('test_item')
    }, { merge: true });
    console.log('✅ arrayUnion successful');
    
    // Clean up
    await testRef.update({
      testArray: firebase.firestore.FieldValue.delete()
    });
    console.log('✅ Array operations working');
    
  } catch (error) {
    console.error('❌ Array operations failed:', error);
  }
}

// Run tests
if (currentUser) {
  testSimpleOperation().then(() => {
    testArrayOperations();
  });
}
