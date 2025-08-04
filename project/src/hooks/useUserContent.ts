import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { getUserContent, addUserContent, updateUserContent, removeUserContent } from '../services/userContent.service';
import { useAuth } from '../contexts/AuthContext';

export const useUserContent = () => {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('userContent');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userContent', JSON.stringify(content));
  }, [content]);

  // Load user content
  const loadContent = useCallback(async () => {
    if (!user || !user.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const userContent = await getUserContent(user.id);
      // Only overwrite if backend has data
      if (userContent && userContent.length > 0) {
        setContent(userContent);
      }
      // Otherwise, keep localStorage content
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

  // Add new content
  const addContent = useCallback((newContent: ContentItem) => {
    setContent(prevContent => {
      const updated = addUserContent(prevContent, newContent);
      localStorage.setItem('userContent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update existing content
  const updateContent = useCallback((updatedContent: ContentItem) => {
    setContent(prevContent => {
      const updated = updateUserContent(prevContent, updatedContent);
      localStorage.setItem('userContent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Remove content
  const removeContent = useCallback((contentId: string) => {
    setContent(prevContent => {
      const updated = removeUserContent(prevContent, contentId);
      localStorage.setItem('userContent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Refresh content
  const refreshContent = useCallback(() => {
    loadContent();
  }, [loadContent]);

  // Check if user has real content (not default content)
  const hasRealContent = content.some(item => !item.id.startsWith('default-'));

  // Get content statistics
  const contentStats = {
    total: content.length,
    realContent: content.filter(item => !item.id.startsWith('default-')).length,
    byType: content.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: content.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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