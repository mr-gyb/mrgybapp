import { 
  collection, 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Notification } from '../types/friendships';

const usersCollection = collection(db, 'users');

/**
 * Add a notification to a user's notification array
 */
export const addNotification = async (
  userId: string, 
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData: any = userDoc.data();
    const notifications = userData.notifications || [];
    
    const notificationId = doc(collection(db, 'notifications')).id;
    
    // Create notification with serverTimestamp for Firestore compatibility
    const newNotification = {
      id: notificationId,
      ...notification,
      timestamp: serverTimestamp(),
      read: false
    };

    await updateDoc(userRef, {
      notifications: [...notifications, newNotification]
    });

    console.log('✅ Notification added successfully');
  } catch (error) {
    console.error('❌ Error adding notification:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  userId: string, 
  notificationId: string
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    const updatedNotifications = notifications.map((notification: Notification) => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );

    await updateDoc(userRef, {
      notifications: updatedNotifications
    });

    console.log('✅ Notification marked as read');
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Remove a notification
 */
export const removeNotification = async (
  userId: string, 
  notificationId: string
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    const updatedNotifications = notifications.filter(
      (notification: Notification) => notification.id !== notificationId
    );

    await updateDoc(userRef, {
      notifications: updatedNotifications
    });

    console.log('✅ Notification removed');
  } catch (error) {
    console.error('❌ Error removing notification:', error);
    throw error;
  }
};

/**
 * Archive a notification (hide from inbox)
 */
export const archiveNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) throw new Error('User not found');

    const userData = userDoc.data() as any;
    const notifications = userData.notifications || [];

    const updated = notifications.map((n: any) =>
      n.id === notificationId ? { ...n, archived: true, read: true } : n
    );

    await updateDoc(userRef, { notifications: updated });
    console.log('📦 Notification archived:', notificationId);
  } catch (error) {
    console.error('❌ Error archiving notification:', error);
    throw error;
  }
};

/**
 * Watch user notifications in real-time
 */
export const watchUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): (() => void) => {
  try {
    const userRef = doc(usersCollection, userId);
    
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData: any = doc.data();
        const notifications = (userData.notifications || []).filter((n: any) => !n.archived);
        callback(notifications);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('❌ Error watching user notifications:', error);
      handleFirestoreError(error);
    });

    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notifications listener:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return 0;
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    return notifications.filter((notification: Notification) => !notification.read).length;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(usersCollection, userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const notifications = userData.notifications || [];
    
    const updatedNotifications = notifications.map((notification: Notification) => ({
      ...notification,
      read: true
    }));

    await updateDoc(userRef, {
      notifications: updatedNotifications
    });

    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Create friend request notification
 * Adds a new friend request notification to Firestore
 */
export const sendFriendRequestNotification = async (
  senderId: string,
  receiverId: string,
  senderName: string
): Promise<void> => {
  try {
    await addNotification(receiverId, {
      type: 'friend_request',
      fromUser: senderId,
      message: `${senderName} sent you a friend request!`
    });
  } catch (error) {
    console.error('❌ Error creating friend request notification:', error);
    throw error;
  }
};

/**
 * @deprecated Use sendFriendRequestNotification instead
 */
export const createFriendRequestNotification = sendFriendRequestNotification;

/**
 * Create friend request accepted notification
 */
export const createFriendRequestAcceptedNotification = async (
  senderId: string,
  receiverId: string,
  senderName: string
): Promise<void> => {
  try {
    await addNotification(receiverId, {
      type: 'request_accepted',
      fromUser: senderId,
      message: `${senderName} accepted your friend request!`
    });
  } catch (error) {
    console.error('❌ Error creating friend request accepted notification:', error);
    throw error;
  }
};


/**
 * Watch notifications for a user
 */
export const watchNotifications = (
  uid: string, 
  cb: (items: Notification[]) => void
): (() => void) => {
  try {
    const userRef = doc(usersCollection, uid);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        
        // Get notifications array, filter by valid types
        const notifications = (data.notifications || [])
          .filter((n: any) => n.type === 'friend_request' || n.type === 'request_accepted')
          .map((n: any) => ({
            id: n.id,
            type: n.type,
            fromUser: n.fromUser || n.fromUserUid || '',
            message: n.message,
            timestamp: n.timestamp,
            read: n.read || false
          } as Notification));

        // Sort by timestamp (newest first)
        notifications.sort((a: Notification, b: Notification) => {
          const aTime = a.timestamp?.toMillis?.() || 0;
          const bTime = b.timestamp?.toMillis?.() || 0;
          return bTime - aTime;
        });
        
        cb(notifications);
      } else {
        cb([]);
      }
    }, (error) => {
      console.error('❌ Error watching notifications:', error);
      handleFirestoreError(error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Error setting up notifications listener:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as any;
      
      // Update old notifications array
      const updatedNotifications = (userData.notifications || []).map((n: any) => ({ ...n, read: true }));
      
      // Update incomingRequests to mark as seen
      const updatedIncomingRequests = (userData.incomingRequests || []).map((req: any) => ({
        ...req,
        seen: true
      }));
      
      await updateDoc(userRef, {
        notifications: updatedNotifications,
        incomingRequests: updatedIncomingRequests,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ All notifications marked as read for user ${uid}`);
    }
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (uid: string, notifId: string): Promise<void> => {
  try {
    const userRef = doc(usersCollection, uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as any;
      
      // Update old notifications array
      const updatedNotifications = (userData.notifications || []).map((n: any) => 
        n.id === notifId ? { ...n, read: true } : n
      );
      
      // Update incomingRequests if the notification ID matches a request
      const updatedIncomingRequests = (userData.incomingRequests || []).map((req: any) => {
        const reqId = req.id || (req.fromUid + '_' + req.createdAt?.toMillis?.() || Date.now());
        return reqId === notifId ? { ...req, seen: true } : req;
      });
      
      await updateDoc(userRef, {
        notifications: updatedNotifications,
        incomingRequests: updatedIncomingRequests,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Notification ${notifId} marked as read for user ${uid}`);
    }
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

// All functions are already exported above
