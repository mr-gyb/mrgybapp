import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface GeneratedContent {
  id: string;
  user_id: string;
  original_text: string;
  generated_content: string;
  title: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface ContentError {
  message: string;
  details?: string;
}

export const generateContent = async (text: string): Promise<string> => {
  try {
    const response = await fetch('https://hook.us1.make.com/cgjp8jnmg4fm4s2w87t7pjdugg0j74a7', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    const data = await response.json();
    return data.generated_content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

export const saveContent = async (
  userId: string,
  originalText: string,
  generatedContent: string,
  title: string
): Promise<GeneratedContent> => {
  try {
    const contentData = {
      user_id: userId,
      original_text: originalText,
      generated_content: generatedContent,
      title,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const contentRef = await addDoc(collection(db, 'generated_content'), contentData);
    
    return {
      id: contentRef.id,
      ...contentData
    } as GeneratedContent;
  } catch (error) {
    console.error('Error saving content:', error);
    throw error;
  }
};

export const getContentHistory = async (userId: string): Promise<GeneratedContent[]> => {
  try {
    const contentQuery = query(
      collection(db, 'generated_content'),
      where('user_id', '==', userId),
      orderBy('created_at', { direction: 'desc' })
    );
    
    const snapshot = await getDocs(contentQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GeneratedContent[];
  } catch (error) {
    console.error('Error fetching content history:', error);
    throw error;
  }
};

export const updateContent = async (
  contentId: string,
  updates: Partial<GeneratedContent>
): Promise<GeneratedContent> => {
  try {
    const contentRef = doc(db, 'generated_content', contentId);
    
    await updateDoc(contentRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    
    const updatedDoc = await getDoc(contentRef);
    
    if (!updatedDoc.exists()) {
      throw new Error('Content not found');
    }
    
    return {
      id: contentId,
      ...updatedDoc.data()
    } as GeneratedContent;
  } catch (error) {
    console.error('Error updating content:', error);
    throw error;
  }
};

export const deleteContent = async (contentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'generated_content', contentId));
  } catch (error) {
    console.error('Error deleting content:', error);
    throw error;
  }
};