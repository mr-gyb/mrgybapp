/**
 * Firebase Index Helper
 * Provides information about required indexes for better performance
 */

export interface FirebaseIndexInfo {
  collection: string;
  fields: string[];
  description: string;
  createUrl?: string;
}

export const requiredIndexes: FirebaseIndexInfo[] = [
  {
    collection: 'new_content',
    fields: ['userId', 'createdAt'],
    description: 'For querying user content with date ordering',
    createUrl: 'https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes'
  },
  {
    collection: 'media_content',
    fields: ['userId', 'createdAt'],
    description: 'For querying legacy media content with date ordering',
    createUrl: 'https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes'
  },
  {
    collection: 'content_performance',
    fields: ['contentId', 'lastUpdated'],
    description: 'For querying content performance with date ordering',
    createUrl: 'https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes'
  }
];

export const firebaseIndexHelper = {
  /**
   * Get all required indexes
   */
  getRequiredIndexes: (): FirebaseIndexInfo[] => {
    return requiredIndexes;
  },

  /**
   * Get indexes for a specific collection
   */
  getIndexesForCollection: (collectionName: string): FirebaseIndexInfo[] => {
    return requiredIndexes.filter(index => index.collection === collectionName);
  },

  /**
   * Open Firebase console for index creation
   */
  openIndexConsole: (): void => {
    window.open('https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes', '_blank');
  },

  /**
   * Generate index creation commands for Firebase CLI
   */
  generateCLICommands: (): string[] => {
    return requiredIndexes.map(index => {
      const fields = index.fields.join(', ');
      return `firebase firestore:indexes:create ${index.collection} ${fields}`;
    });
  },

  /**
   * Check if an index is needed based on error message
   */
  isIndexError: (error: any): boolean => {
    if (error instanceof Error) {
      return error.message.includes('index') || error.message.includes('Index');
    }
    return false;
  },

  /**
   * Get helpful message for index errors
   */
  getIndexErrorMessage: (): string => {
    return `
Firebase Index Required!

To improve performance, consider creating the following composite indexes:

${requiredIndexes.map((index, i) => 
  `${i + 1}. Collection: ${index.collection}
   Fields: ${index.fields.join(', ')}
   Description: ${index.description}`
).join('\n\n')}

You can create these indexes in the Firebase Console:
https://console.firebase.google.com/project/mr-gyb-ai-app-108/firestore/indexes

Or use Firebase CLI commands:
${generateCLICommands().join('\n')}

For now, content will load without ordering to avoid the index requirement.
    `.trim();
  }
};

export default firebaseIndexHelper;
