import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { getUserContent, addUserContent, updateUserContent, removeUserContent } from '../services/userContent.service';
import { useAuth } from '../contexts/AuthContext';

export const useUserContent = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user-specific localStorage key
  const getStorageKey = () => {
    return user?.uid ? `userContent_${user.uid}` : null;
  };

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
      // Clear any old content from previous user
      setContent([]);
      
      // Try to load from localStorage first (user-specific key)
      const storageKey = getStorageKey();
      if (storageKey) {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedContent = JSON.parse(saved);
          setContent(parsedContent);
        }
      }
      
      // Then fetch from backend and update if backend has data
      const userContent = await getUserContent(user.uid);
      if (userContent && userContent.length > 0) {
        setContent(userContent);
        // Update localStorage with fresh data
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(userContent));
        }
      }
    } catch (err) {
      console.error('Error loading user content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load content on mount and when user changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Save content to localStorage whenever it changes (user-specific key)
  useEffect(() => {
    const storageKey = getStorageKey();
    if (storageKey && content.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(content));
    }
  }, [content, user]);

  // Add new content
  const addContent = useCallback((newContent: ContentItem) => {
    setContent(prevContent => {
      return addUserContent(prevContent, newContent);
    });
  }, []);

  // Update existing content
  const updateContent = useCallback((updatedContent: ContentItem) => {
    setContent(prevContent => {
      return updateUserContent(prevContent, updatedContent);
    });
  }, []);

  // Remove content
  const removeContent = useCallback((contentId: string) => {
    setContent(prevContent => {
      return removeUserContent(prevContent, contentId);
    });
  }, []);

  // Refresh content
  const refreshContent = useCallback(() => {
    loadContent();
  }, [loadContent]);

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
    content,
    isLoading,
    error,
    hasRealContent,
    contentStats,
    loadContent,
    addContent,
    updateContent,
    removeContent,
    refreshContent
  };
}; 