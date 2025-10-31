import { 
  doc, getDoc, updateDoc, setDoc, onSnapshot, arrayUnion, arrayRemove, serverTimestamp
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { IncomingRequest, SentRequest, FriendRef } from "../types/friendships";
import { createOrGetDirectChat } from "./chats";

/**
 * Ensure user document exists with required arrays
 */
export async function ensureUserDocument(uid: string, userData?: any) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  
  if (!snap.exists()) {
    // Create user document if it doesn't exist
    const defaultData = {
      uid,
      name: userData?.name || 'Unknown User',
      email: userData?.email || '',
      incomingRequests: [],
      sentRequests: [],
      friends: [],
      ...userData
    };
    await setDoc(ref, defaultData);
    console.log('✅ Created user document for:', uid);
    return defaultData;
  }
  
  const data = snap.data() || {};
  
  // Ensure required arrays exist
  const updates: any = {};
  if (!Array.isArray(data.incomingRequests)) updates.incomingRequests = [];
  if (!Array.isArray(data.sentRequests)) updates.sentRequests = [];
  if (!Array.isArray(data.friends)) updates.friends = [];
  
  if (Object.keys(updates).length > 0) {
    await setDoc(ref, updates, { merge: true });
    console.log('✅ Updated user document arrays for:', uid);
  }
  
  return { ...data, ...updates };
}

/**
 * Send a friend request from one user to another
 */
export async function sendFriendRequest(fromUid: string, toUid: string, fromName: string, toName: string) {
  console.log('📤 Sending friend request from', fromUid, 'to', toUid);
  
  try {
    // Ensure both user documents exist
    await ensureUserDocument(fromUid, { name: fromName });
    await ensureUserDocument(toUid, { name: toName });
    
    const id = `${fromUid}_${toUid}`;
    const requestData = {
      id, 
      fromUid, 
      fromName, 
      createdAt: serverTimestamp(), 
      seen: false
    };
    
    const sentData = {
      id, 
      toUid, 
      toName, 
      createdAt: serverTimestamp()
    };
    
    // Get current data to append to existing arrays
    const [fromDoc, toDoc] = await Promise.all([
      getDoc(doc(db, "users", fromUid)),
      getDoc(doc(db, "users", toUid))
    ]);
    
    const fromData = fromDoc.data() || {};
    const toData = toDoc.data() || {};
    
    // Append to existing arrays
    const updatedFromSent = [...(fromData.sentRequests || []), sentData];
    const updatedToIncoming = [...(toData.incomingRequests || []), requestData];
    
    // Update both documents
    await Promise.all([
      setDoc(doc(db, "users", fromUid), {
        sentRequests: updatedFromSent
      }, { merge: true }),
      setDoc(doc(db, "users", toUid), {
        incomingRequests: updatedToIncoming
      }, { merge: true })
    ]);
    
    console.log('✅ Friend request sent successfully');
  } catch (error) {
    console.error('❌ Error sending friend request:', error);
    throw error;
  }
}

/**
 * Accept a friend request and create chat room
 */
export async function acceptFriendRequest(currentUid: string, fromUid: string) {
  console.log('✅ Accepting friend request from', fromUid, 'by', currentUid);
  
  try {
    const id = `${fromUid}_${currentUid}`;
    
    // Get current data
    const [currentDoc, fromDoc] = await Promise.all([
      getDoc(doc(db, "users", currentUid)),
      getDoc(doc(db, "users", fromUid))
    ]);
    
    const currentData = currentDoc.data() || {};
    const fromData = fromDoc.data() || {};
    
    // Remove from arrays and add to friends
    const updatedCurrentIncoming = (currentData.incomingRequests || []).filter((r: any) => r.id !== id);
    const updatedFromSent = (fromData.sentRequests || []).filter((r: any) => r.id !== id);
    
    const newFriendRef = { uid: fromUid, since: serverTimestamp() };
    const updatedCurrentFriends = [...(currentData.friends || []), newFriendRef];
    const updatedFromFriends = [...(fromData.friends || []), { uid: currentUid, since: serverTimestamp() }];
    
    // Update both users
    await Promise.all([
      setDoc(doc(db, "users", currentUid), {
        incomingRequests: updatedCurrentIncoming,
        friends: updatedCurrentFriends
      }, { merge: true }),
      setDoc(doc(db, "users", fromUid), {
        sentRequests: updatedFromSent,
        friends: updatedFromFriends
      }, { merge: true })
    ]);
    
    // Create chat room after successful friend acceptance
    await createOrGetDirectChat(currentUid, fromUid);
    console.log('✅ Friend request accepted and chat created');
  } catch (error) {
    console.error('❌ Error accepting friend request:', error);
    throw error;
  }
}

/**
 * Decline a friend request (no chat creation)
 */
export async function declineFriendRequest(currentUid: string, fromUid: string) {
  console.log('❌ Declining friend request from', fromUid, 'by', currentUid);
  
  try {
    const id = `${fromUid}_${currentUid}`;
    
    // Get current data
    const [currentDoc, fromDoc] = await Promise.all([
      getDoc(doc(db, "users", currentUid)),
      getDoc(doc(db, "users", fromUid))
    ]);
    
    const currentData = currentDoc.data() || {};
    const fromData = fromDoc.data() || {};
    
    // Remove from arrays
    const updatedCurrentIncoming = (currentData.incomingRequests || []).filter((r: any) => r.id !== id);
    const updatedFromSent = (fromData.sentRequests || []).filter((r: any) => r.id !== id);
    
    // Update both users
    await Promise.all([
      setDoc(doc(db, "users", currentUid), {
        incomingRequests: updatedCurrentIncoming
      }, { merge: true }),
      setDoc(doc(db, "users", fromUid), {
        sentRequests: updatedFromSent
      }, { merge: true })
    ]);
    
    console.log('✅ Friend request declined');
  } catch (error) {
    console.error('❌ Error declining friend request:', error);
    throw error;
  }
}

/**
 * Watch incoming friend requests in real-time
 */
export function watchIncomingRequests(uid: string, cb: (reqs: IncomingRequest[]) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    const d = snap.data() || {};
    cb((d.incomingRequests || []) as IncomingRequest[]);
  });
}

/**
 * Watch sent friend requests in real-time
 */
export function watchSentRequests(uid: string, cb: (reqs: SentRequest[]) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    const d = snap.data() || {};
    cb((d.sentRequests || []) as SentRequest[]);
  });
}

/**
 * Mark all incoming requests as seen
 */
export async function markIncomingSeen(uid: string) {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    const d = snap.data() || {};
    const updated = (d.incomingRequests || []).map((r: any) => ({ ...r, seen: true }));
    await setDoc(ref, { incomingRequests: updated }, { merge: true });
    console.log('✅ Marked incoming requests as seen');
  } catch (error) {
    console.error('❌ Error marking requests as seen:', error);
    throw error;
  }
}

/**
 * Remove a friend connection
 */
export async function removeConnection(currentUid: string, friendUid: string) {
  try {
    const [currentDoc, friendDoc] = await Promise.all([
      getDoc(doc(db, "users", currentUid)),
      getDoc(doc(db, "users", friendUid))
    ]);
    
    const currentData = currentDoc.data() || {};
    const friendData = friendDoc.data() || {};
    
    const currentFriends = (currentData.friends || []).filter((f: any) => f.uid !== friendUid);
    const friendFriends = (friendData.friends || []).filter((f: any) => f.uid !== currentUid);
    
    await Promise.all([
      setDoc(doc(db, "users", currentUid), { friends: currentFriends }, { merge: true }),
      setDoc(doc(db, "users", friendUid), { friends: friendFriends }, { merge: true })
    ]);
    
    console.log('✅ Friend connection removed');
  } catch (error) {
    console.error('❌ Error removing friend connection:', error);
    throw error;
  }
}

/**
 * Watch user's friends list
 */
export function watchConnections(uid: string, cb: (friends: string[]) => void) {
  return onSnapshot(doc(db, "users", uid), (snap) => {
    const d = snap.data() || {};
    const friends = (d.friends || []).map((f: any) => f.uid);
    cb(friends);
  });
}