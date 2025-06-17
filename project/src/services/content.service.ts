import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { ContentDerivative } from '../types/content';

const mockDerivatives: ContentDerivative[] = [
  {
    id: '1',
    derivative_type: 'headline',
    content: 'Innovative Solutions for Modern Business Challenges',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    derivative_type: 'blog',
    content: 'In today\'s rapidly evolving business landscape, organizations face unprecedented challenges...',
    created_at: new Date().toISOString()
  }
];

export const analyzeContent = async (text: string): Promise<string> => {
  // In a real implementation, you would send the text to an API for analysis
  // For now, just return a UUID
  return uuidv4();
};

export const getContentAnalysis = async (analysisId: string) => {
  // In a real implementation, you would fetch the analysis results from Firestore
  // For now, return mock data
  return {
    id: analysisId,
    content_derivatives: mockDerivatives
  };
};

export const saveContent = async (
  userId: string,
  originalText: string,
  generatedContent: string,
  title: string
) => {
  try {
    const contentData = {
      userId,
      originalText,
      generatedContent,
      title,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    console.log("generated_content here");
    const contentRef = await addDoc(collection(db, 'generated_content'), contentData);
    
    return {
      id: contentRef.id,
      ...contentData
    };
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

export const getContentHistory = async (userId: string) => {
  try {
    const contentQuery = query(
      collection(db, 'generated_content'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const contentSnapshot = await getDocs(contentQuery);
    
    return contentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting content history:', error);
    return [];
  }
};

export const updateContent = async (contentId: string, updates: any) => {
  try {
    const contentRef = doc(db, 'generated_content', contentId);
    
    await updateDoc(contentRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    const updatedDoc = await getDoc(contentRef);
    
    return {
      id: contentId,
      ...updatedDoc.data()
    };
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const deleteContent = async (contentId: string) => {
  try {
    await deleteDoc(doc(db, 'generated_content', contentId));
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};