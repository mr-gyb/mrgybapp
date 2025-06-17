import axiosInstance from '../axios';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { MediaUploadResult } from '../../types/media';

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
    processMediaContent(mediaRef.id, publicUrl, file.type);
    
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
    processMediaContent(mediaRef.id, url, 'link');
    
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
    // In a real implementation, this would call an API to process the content
    // For now, we'll just simulate the process by adding some derivatives
    
    // Generate a blog post
    await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'blog',
      content: `This is a generated blog post based on the ${contentType} content at ${url}.`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate a headline
    await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'headline',
      content: `Amazing ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content Title`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Generate SEO tags
    await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'seo_tags',
      content: 'content, media, digital, marketing, growth',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing media content:', error);
    throw error;
  }
};

export const getMediaContent = async (userId: string) => {
  try {
    const response = await axiosInstance.get('/media', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching media content:', error);
    throw error;
  }
};

export const getMediaDerivatives = async (mediaId: string) => {
  try {
    const response = await axiosInstance.get(`/media/${mediaId}/derivatives`);
    return response.data;
  } catch (error) {
    console.error('Error fetching media derivatives:', error);
    throw error;
  }
};

export const deleteMedia = async (mediaId: string) => {
  try {
    const response = await axiosInstance.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting media:', error);
    throw error;
  }
};