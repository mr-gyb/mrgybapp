import { ContentItem } from '../types/content';

export interface ContentPersistenceData {
  content: ContentItem[];
  lastUpdated: string;
  userId: string;
  version: string;
}

const CURRENT_VERSION = '1.0.0';

export const contentPersistence = {
  /**
   * Save content to localStorage with metadata
   */
  saveContent: (userId: string, content: ContentItem[]): void => {
    try {
      const storageKey = `userContent_${userId}`;
      const data: ContentPersistenceData = {
        content,
        lastUpdated: new Date().toISOString(),
        userId,
        version: CURRENT_VERSION
      };
      
      localStorage.setItem(storageKey, JSON.stringify(data));
      console.log(`Content saved to localStorage for user ${userId}:`, content.length, 'items');
    } catch (error) {
      console.error('Error saving content to localStorage:', error);
    }
  },

  /**
   * Load content from localStorage with validation
   */
  loadContent: (userId: string): ContentItem[] | null => {
    try {
      const storageKey = `userContent_${userId}`;
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        console.log(`No saved content found for user ${userId}`);
        return null;
      }

      const data: ContentPersistenceData = JSON.parse(saved);
      
      // Validate the data structure
      if (!data.content || !Array.isArray(data.content) || data.userId !== userId) {
        console.warn('Invalid content data in localStorage, clearing');
        localStorage.removeItem(storageKey);
        return null;
      }

      console.log(`Content loaded from localStorage for user ${userId}:`, data.content.length, 'items');
      return data.content;
    } catch (error) {
      console.error('Error loading content from localStorage:', error);
      return null;
    }
  },

  /**
   * Clear content for a user (only when explicitly requested)
   */
  clearContent: (userId: string): void => {
    try {
      const storageKey = `userContent_${userId}`;
      localStorage.removeItem(storageKey);
      console.log(`Content cleared for user ${userId}`);
    } catch (error) {
      console.error('Error clearing content from localStorage:', error);
    }
  },

  /**
   * Clear content for all users (use with caution)
   */
  clearAllContent: (): void => {
    try {
      const keys = Object.keys(localStorage);
      const contentKeys = keys.filter(key => key.startsWith('userContent_'));
      contentKeys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared content for ${contentKeys.length} users`);
    } catch (error) {
      console.error('Error clearing all content from localStorage:', error);
    }
  },

  /**
   * Get content statistics
   */
  getContentStats: (userId: string): { hasContent: boolean; itemCount: number; lastUpdated?: string } => {
    try {
      const storageKey = `userContent_${userId}`;
      const saved = localStorage.getItem(storageKey);
      
      if (!saved) {
        return { hasContent: false, itemCount: 0 };
      }

      const data: ContentPersistenceData = JSON.parse(saved);
      return {
        hasContent: true,
        itemCount: data.content?.length || 0,
        lastUpdated: data.lastUpdated
      };
    } catch (error) {
      console.error('Error getting content stats:', error);
      return { hasContent: false, itemCount: 0 };
    }
  },

  /**
   * Get all stored user IDs
   */
  getAllUserIds: (): string[] => {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith('userContent_'))
        .map(key => key.replace('userContent_', ''));
    } catch (error) {
      console.error('Error getting all user IDs:', error);
      return [];
    }
  },

  /**
   * Check if content exists for a user
   */
  hasContent: (userId: string): boolean => {
    try {
      const storageKey = `userContent_${userId}`;
      const saved = localStorage.getItem(storageKey);
      return !!saved;
    } catch (error) {
      console.error('Error checking if content exists:', error);
      return false;
    }
  }
};
