const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

/**
 * Cloud Function: Auto-create chat room when friend request is accepted
 */
exports.onFriendRequestAccepted = functions.firestore
  .document('friendRequests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Check if request was just accepted
    if (before.status !== 'accepted' && after.status === 'accepted') {
      const { fromUid, toUid } = after;
      
      try {
        // Create chat room
        const chatRoomRef = db.collection('chatRooms').doc();
        await chatRoomRef.set({
          id: chatRoomRef.id,
          members: [fromUid, toUid],
          messages: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Chat room created for users: ${fromUid}, ${toUid}`);
        
        // Send push notification to both users
        await sendChatRoomCreatedNotification(fromUid, toUid);
        
      } catch (error) {
        console.error('❌ Error creating chat room:', error);
      }
    }
  });

/**
 * Cloud Function: Send notification when new message is sent
 */
exports.onNewMessage = functions.firestore
  .document('chatRooms/{chatRoomId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    const beforeMessages = before.messages || [];
    const afterMessages = after.messages || [];
    
    // Check if new message was added
    if (afterMessages.length > beforeMessages.length) {
      const newMessage = afterMessages[afterMessages.length - 1];
      const { sender, content } = newMessage;
      const members = after.members;
      
      // Send notification to other members
      const otherMembers = members.filter(uid => uid !== sender);
      
      for (const memberUid of otherMembers) {
        try {
          await sendMessageNotification(memberUid, sender, content);
        } catch (error) {
          console.error(`❌ Error sending notification to ${memberUid}:`, error);
        }
      }
    }
  });

/**
 * Cloud Function: Clean up old notifications
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days ago
    
    try {
      const usersSnapshot = await db.collection('users').get();
      const batch = db.batch();
      let batchCount = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const notifications = userData.notifications || [];
        
        const recentNotifications = notifications.filter(notif => {
          const notifDate = notif.timestamp.toDate();
          return notifDate > cutoffDate;
        });
        
        if (recentNotifications.length !== notifications.length) {
          batch.update(userDoc.ref, {
            notifications: recentNotifications
          });
          batchCount++;
          
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }
      
      if (batchCount > 0) {
        await batch.commit();
      }
      
      console.log('✅ Cleaned up old notifications');
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  });

/**
 * Helper function: Send chat room created notification
 */
async function sendChatRoomCreatedNotification(fromUid, toUid) {
  try {
    // Get user profiles
    const [fromUserDoc, toUserDoc] = await Promise.all([
      db.collection('users').doc(fromUid).get(),
      db.collection('users').doc(toUid).get()
    ]);
    
    if (fromUserDoc.exists() && toUserDoc.exists()) {
      const fromUser = fromUserDoc.data();
      const toUser = toUserDoc.data();
      
      // Add notification to both users
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'request_accepted',
        fromUser: fromUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      
      // Update both users' notifications
      await Promise.all([
        db.collection('users').doc(toUid).update({
          notifications: admin.firestore.FieldValue.arrayUnion(notification)
        }),
        db.collection('users').doc(fromUid).update({
          notifications: admin.firestore.FieldValue.arrayUnion({
            ...notification,
            fromUser: toUid
          })
        })
      ]);
      
      console.log('✅ Chat room created notifications sent');
    }
  } catch (error) {
    console.error('❌ Error sending chat room notification:', error);
  }
}

/**
 * Helper function: Send message notification
 */
async function sendMessageNotification(recipientUid, senderUid, messageContent) {
  try {
    // Get sender profile
    const senderDoc = await db.collection('users').doc(senderUid).get();
    
    if (senderDoc.exists()) {
      const sender = senderDoc.data();
      
      // Add notification
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'message',
        fromUser: senderUid,
        message: messageContent.substring(0, 100), // Truncate message
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        read: false
      };
      
      await db.collection('users').doc(recipientUid).update({
        notifications: admin.firestore.FieldValue.arrayUnion(notification)
      });
      
      console.log(`✅ Message notification sent to ${recipientUid}`);
    }
  } catch (error) {
    console.error('❌ Error sending message notification:', error);
  }
}
