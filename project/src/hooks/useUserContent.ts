import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { getUserContent, addUserContent, updateUserContent, removeUserContent, deleteUserContent, deleteAllUserContent, cleanupDuplicateContent } from '../services/userContent.service';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { contentPersistence } from '../utils/contentPersistence';
import { doc, getDoc } from 'firebase/firestore';
import { saveUserContent } from '../services/userContent.service';

export const useUserContent = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user content
  const loadContent = useCallback(async () => {
    if (!user?.uid) {
      setContent([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to load from localStorage first (user-specific key) for immediate display
      const savedContent = contentPersistence.loadContent(user.uid);
      if (savedContent && savedContent.length > 0) {
        console.log('Loading content from localStorage:', savedContent.length, 'items');
        setContent(savedContent);
      }
      
      // Then fetch from backend and update if backend has different/more data
      console.log('Fetching content from backend for user:', user.uid);
      const userContent = await getUserContent(user.uid);
      if (userContent && userContent.length > 0) {
        console.log('Backend returned content:', userContent.length, 'items');
        
        // Remove duplicates from backend content
        const uniqueBackendContent = removeDuplicateContent(userContent);
        console.log('After removing duplicates:', uniqueBackendContent.length, 'items');
        
        setContent(uniqueBackendContent);
        // Update localStorage with fresh data
        contentPersistence.saveContent(user.uid, uniqueBackendContent);
        
        // Ensure content is properly synchronized between collections
        await ensureContentSync(user.uid, uniqueBackendContent);
      } else {
        console.log('No content found in backend');
      }
    } catch (err) {
      console.error('Error loading user content:', err);
      setError('Failed to load content. Please try again.');
      
      // If backend fails, keep localStorage content if available
      const savedContent = contentPersistence.loadContent(user.uid);
      if (savedContent && savedContent.length > 0) {
        console.log('Keeping localStorage content after backend error');
        setContent(savedContent);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Function to ensure content is synchronized between collections
  const ensureContentSync = async (userId: string, content: ContentItem[]) => {
    try {
      console.log('Ensuring content synchronization between collections for user:', userId);
      
      // This will ensure that content exists in both new_content and media_content collections
      // The saveUserContent function now saves to both collections
      for (const item of content) {
        // Check if content exists in both collections
        const newContentExists = await checkContentExists('new_content', item.id);
        const mediaContentExists = await checkContentExists('media_content', item.id);
        
        if (!newContentExists || !mediaContentExists) {
          console.log('Content sync needed for item:', item.id);
          // Re-save the content to ensure it exists in both collections
          await saveUserContent(userId, item);
        }
      }
    } catch (error) {
      console.error('Error ensuring content sync:', error);
    }
  };

  // Helper function to check if content exists in a collection
  const checkContentExists = async (collectionName: string, contentId: string): Promise<boolean> => {
    try {
      const docRef = doc(db, collectionName, contentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error(`Error checking content existence in ${collectionName}:`, error);
      return false;
    }
  };

  // Helper function to remove duplicate content
  const removeDuplicateContent = (contentArray: ContentItem[]): ContentItem[] => {
    const seen = new Set();
    const uniqueContent: ContentItem[] = [];
    
    for (const item of contentArray) {
      // Create a unique key based on title and URL
      const key = `${item.title}-${item.originalUrl}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueContent.push(item);
      } else {
        console.log('Removing duplicate content:', {
          title: item.title,
          url: item.originalUrl,
          id: item.id
        });
      }
    }
    
    return uniqueContent;
  };

  // Real-time content listener
  useEffect(() => {
    if (!user?.uid) {
      console.log('No user authenticated, skipping real-time listener');
      return;
    }

    console.log('Setting up real-time listeners for user:', user.uid);
    
    // Listen to both new_content and media_content collections
    const unsubscribeNewContent = onSnapshot(
      query(collection(db, 'new_content'), where('userId', '==', user.uid)),
      (snapshot) => {
        console.log('New content update received:', snapshot.docChanges().length, 'changes');
        handleContentUpdate();
      },
      (err) => {
        console.error('Error listening to new_content changes:', err);
      }
    );

    const unsubscribeMediaContent = onSnapshot(
      query(collection(db, 'media_content'), where('userId', '==', user.uid)),
      (snapshot) => {
        console.log('Media content update received:', snapshot.docChanges().length, 'changes');
        handleContentUpdate();
      },
      (err) => {
        console.error('Error listening to media_content changes:', err);
      }
    );

    // Function to handle content updates from either collection
    const handleContentUpdate = async () => {
      try {
        console.log('Refreshing content after real-time update');
        const userContent = await getUserContent(user.uid);
        console.log('Updated content from backend:', userContent.length, 'items');
        
        // Only update if we have content or if the user is still authenticated
        if (userContent.length > 0 || user?.uid) {
          // Remove duplicates before updating state
          const uniqueContent = removeDuplicateContent(userContent);
          console.log('After removing duplicates from real-time update:', uniqueContent.length, 'items');
          
          setContent(uniqueContent);
          // Update localStorage with fresh data
          contentPersistence.saveContent(user.uid, uniqueContent);
        }
      } catch (error) {
        console.error('Error refreshing content after real-time update:', error);
        // On error, try to load from localStorage as fallback
        const savedContent = contentPersistence.loadContent(user.uid);
        if (savedContent && savedContent.length > 0) {
          console.log('Using localStorage fallback after real-time update error');
          setContent(savedContent);
        }
      }
    };

    return () => {
      console.log('Cleaning up real-time listeners for user:', user.uid);
      unsubscribeNewContent();
      unsubscribeMediaContent();
    };
  }, [user?.uid]);

  // Load content on mount and when user changes
  useEffect(() => {
    if (user?.uid) {
      console.log('User authenticated, loading content for:', user.uid);
      loadContent();
    } else {
      console.log('No user authenticated, but keeping content in memory for potential re-auth');
      // Don't clear content immediately when user signs out
      // This prevents content loss during sign out/sign in cycles
      setIsLoading(false);
    }
  }, [loadContent, user?.uid]);

  // Only clear content when component unmounts or user explicitly changes
  useEffect(() => {
    return () => {
      // Cleanup function - only clear content when component is actually unmounting
      console.log('Component unmounting, clearing content');
      setContent([]);
    };
  }, []);

  // Handle user re-authentication and content restoration
  useEffect(() => {
    if (user?.uid) {
      // Check if we have content in localStorage for this user
      const hasStoredContent = contentPersistence.hasContent(user.uid);
      
      if (hasStoredContent && content.length === 0) {
        console.log('User re-authenticated, restoring content from localStorage');
        const savedContent = contentPersistence.loadContent(user.uid);
        if (savedContent && savedContent.length > 0) {
          console.log('Restored content from localStorage:', savedContent.length, 'items');
          setContent(savedContent);
        }
      }
    }
  }, [user?.uid, content.length]);

  // Fallback: If content is empty after loading and we have localStorage data, use it
  useEffect(() => {
    if (!isLoading && content.length === 0 && user?.uid) {
      const savedContent = contentPersistence.loadContent(user.uid);
      if (savedContent && savedContent.length > 0) {
        console.log('Using fallback localStorage content:', savedContent.length, 'items');
        setContent(savedContent);
      }
    }
  }, [isLoading, content.length, user?.uid]);

  // Save content to localStorage whenever it changes (user-specific key)
  useEffect(() => {
    if (user?.uid && content.length > 0) {
      contentPersistence.saveContent(user.uid, content);
    }
  }, [content, user?.uid]);

  // Add new content
  const addContent = useCallback((newContent: ContentItem) => {
    setContent(prevContent => {
      // Check if content with the same ID already exists
      const existingContent = prevContent.find(item => item.id === newContent.id);
      if (existingContent) {
        console.log('Content with ID already exists, skipping duplicate:', newContent.id);
        return prevContent;
      }
      
      // Check if content with the same title and URL already exists (prevent duplicates)
      const duplicateContent = prevContent.find(item => 
        item.title === newContent.title && 
        item.originalUrl === newContent.originalUrl &&
        !item.id.startsWith('default-') // Don't check against sample content
      );
      
      if (duplicateContent) {
        console.log('Duplicate content detected, skipping:', {
          title: newContent.title,
          url: newContent.originalUrl,
          existingId: duplicateContent.id,
          newId: newContent.id
        });
        return prevContent;
      }
      
      console.log('Adding new content:', newContent.id, newContent.title);
      return addUserContent(prevContent, newContent);
    });
  }, []);

  // Update existing content
  const updateContent = useCallback((updatedContent: ContentItem) => {
    setContent(prevContent => {
      // Ensure prevContent is an array
      if (!Array.isArray(prevContent)) {
        console.warn('Previous content is not an array, resetting to empty array');
        prevContent = [];
      }
      return updateUserContent(prevContent, updatedContent);
    });
  }, []);

  // Remove content
  const removeContent = useCallback(async (contentId: string) => {
    if (!user?.uid) {
      console.warn('Cannot delete content: no user authenticated');
      return;
    }

    try {
      console.log(`Deleting content: ${contentId}`);
      
      // First, remove from Firebase database
      await deleteUserContent(user.uid, contentId);
      
      // Then update local state
      setContent(prevContent => {
        const updatedContent = removeUserContent(prevContent, contentId);
        // Update localStorage
        if (user?.uid) {
          contentPersistence.saveContent(user.uid, updatedContent);
        }
        return updatedContent;
      });
      
      console.log(`Content ${contentId} successfully deleted`);
    } catch (error) {
      console.error(`Error deleting content ${contentId}:`, error);
      // Even if database deletion fails, we might want to remove from local state
      // This prevents the UI from being stuck with content that can't be deleted
      setContent(prevContent => {
        const updatedContent = removeUserContent(prevContent, contentId);
        if (user?.uid) {
          contentPersistence.saveContent(user.uid, updatedContent);
        }
        return updatedContent;
      });
    }
  }, [user?.uid]);

  // Refresh content
  const refreshContent = useCallback(() => {
    loadContent();
  }, [loadContent]);

  // Manual content synchronization
  const syncContent = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      console.log('Manual content synchronization triggered');
      const userContent = await getUserContent(user.uid);
      if (userContent && userContent.length > 0) {
        // Remove duplicates before syncing
        const uniqueContent = removeDuplicateContent(userContent);
        console.log('After removing duplicates from manual sync:', uniqueContent.length, 'items');
        
        await ensureContentSync(user.uid, uniqueContent);
        setContent(uniqueContent);
        contentPersistence.saveContent(user.uid, uniqueContent);
        console.log('Content synchronization completed');
      }
    } catch (error) {
      console.error('Error during manual content synchronization:', error);
    }
  }, [user?.uid]);

  // Remove all content for the user
  const removeAllContent = useCallback(async () => {
    if (!user?.uid) {
      console.warn('Cannot delete all content: no user authenticated');
      return;
    }

    try {
      console.log('Deleting all content for user:', user.uid);
      await deleteAllUserContent(user.uid);
      setContent([]);
      contentPersistence.clearContent(user.uid);
      console.log('All content successfully deleted for user:', user.uid);
    } catch (error) {
      console.error('Error deleting all content for user:', user.uid, error);
    }
  }, [user?.uid]);

  // Clean up duplicate content
  const cleanupDuplicates = useCallback(async () => {
    if (!user?.uid) {
      console.warn('Cannot cleanup duplicates: no user authenticated');
      return;
    }

    try {
      console.log('Cleaning up duplicate content for user:', user.uid);
      const result = await cleanupDuplicateContent(user.uid);
      console.log('Duplicate cleanup result:', result);
      
      // Refresh content after cleanup
      await loadContent();
      
      return result;
    } catch (error) {
      console.error('Error cleaning up duplicates for user:', user.uid, error);
      throw error;
    }
  }, [user?.uid, loadContent]);

  // Check if user has real content (not default content)
  const hasRealContent =
  Array.isArray(content) && content.some(item => !item.id.startsWith('default-'));

  // Get content statistics
  const contentStats = {
    total: Array.isArray(content) ? content.length : 0,
    realContent: Array.isArray(content) 
      ? content.filter(item => !item.id.startsWith('default-')).length 
      : 0,
    byType: Array.isArray(content) 
      ? content.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {},
    byStatus: Array.isArray(content) 
      ? content.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      : {}
  };

  return {
    content: Array.isArray(content) ? content : [], // Ensure we always return an array
    isLoading,
    error,
    hasRealContent,
    contentStats,
    loadContent,
    addContent,
    updateContent,
    removeContent,
    refreshContent,
    syncContent,
    removeAllContent,
    cleanupDuplicates
  };
}; 