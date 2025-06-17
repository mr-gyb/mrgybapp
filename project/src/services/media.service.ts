import { collection, addDoc, getDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
import axios from 'axios';
import { MediaUploadResult, MediaContent, MediaDerivative } from '../types/media';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const uploadMedia = async (
  file: File,
  userId: string
): Promise<MediaUploadResult> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;
    const storageRef = ref(storage, `media-content/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const publicUrl = await getDownloadURL(storageRef);
    
    const mediaData = {
      userId,
      contentType: file.type.split('/')[0],
      storagePath: fileName,
      originalUrl: publicUrl,
      metadata: {
        size: file.size,
        type: file.type,
        name: file.name
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const mediaRef = await addDoc(collection(db, 'media_content'), mediaData);
    
    // Start processing the media content
    await processMediaContent(mediaRef.id, publicUrl, file.type);
    
    return {
      id: mediaRef.id,
      url: publicUrl,
      type: file.type.split('/')[0]
    };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

export const processMediaLink = async (url: string, userId: string): Promise<MediaUploadResult> => {
  try {
    const mediaData = {
      userId,
      contentType: 'link',
      originalUrl: url,
      metadata: {
        sourceUrl: url
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const mediaRef = await addDoc(collection(db, 'media_content'), mediaData);
    
    // Start processing the link content
    await processMediaContent(mediaRef.id, url, 'link');
    
    return {
      id: mediaRef.id,
      url: url,
      type: 'link'
    };
  } catch (error) {
    console.error('Error processing link:', error);
    throw error;
  }
};

export const processMediaContent = async (
  mediaId: string,
  url: string,
  contentType: string
): Promise<void> => {
  try {
    // Generate blog post and headline
    const blogResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content writer. Create a blog post and headline based on the provided content.'
        },
        {
          role: 'user',
          content: `Create a blog post and headline for this content: ${url}`
        }
      ]
    });

    const blogContent = blogResponse.choices[0]?.message?.content;
    if (blogContent) {
      const [headline, ...blogParts] = blogContent.split('\n\n');
      
      // Save headline
      await addDoc(collection(db, 'media_derivatives'), {
        mediaId,
        derivativeType: 'headline',
        content: headline.replace('Headline: ', ''),
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Save blog post
      await addDoc(collection(db, 'media_derivatives'), {
        mediaId,
        derivativeType: 'blog',
        content: blogParts.join('\n\n'),
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Generate SEO tags
    const seoResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Generate relevant SEO tags and keywords for the content.'
        },
        {
          role: 'user',
          content: `Generate SEO tags for this content: ${url}`
        }
      ]
    });

    const seoTags = seoResponse.choices[0]?.message?.content;
    if (seoTags) {
      await addDoc(collection(db, 'media_derivatives'), {
        mediaId,
        derivativeType: 'seo_tags',
        content: seoTags,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error processing media content:', error);
    throw error;
  }
};

export const getMediaContent = async (userId: string): Promise<MediaContent[]> => {
  try {
    const mediaQuery = query(
      collection(db, 'media_content'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const mediaSnapshot = await getDocs(mediaQuery);
    const mediaContent: MediaContent[] = [];
    
    for (const mediaDoc of mediaSnapshot.docs) {
      const mediaData = mediaDoc.data();
      
      // Get derivatives for this media
      const derivativesQuery = query(
        collection(db, 'media_derivatives'),
        where('mediaId', '==', mediaDoc.id)
      );
      
      const derivativesSnapshot = await getDocs(derivativesQuery);
      const derivatives = derivativesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaDerivative[];
      
      mediaContent.push({
        id: mediaDoc.id,
        ...mediaData,
        media_derivatives: derivatives
      } as MediaContent);
    }
    
    return mediaContent;
  } catch (error) {
    console.error('Error fetching media content:', error);
    throw error;
  }
};