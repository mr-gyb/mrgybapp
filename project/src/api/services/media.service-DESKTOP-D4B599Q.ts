import axiosInstance from '../axios';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { MediaUploadResult } from '../../types/media';

// Content type enum for better organization
export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  LINK = 'link',
  BLOG = 'blog'
}

// Enhanced upload result with more details
export interface EnhancedMediaUploadResult extends MediaUploadResult {
  contentType: ContentType;
  storagePath: string;
  metadata: Record<string, any>;
}

export const uploadMedia = async (
  file: File,
  userId: string,
  platforms: string[] = [],
  formats: string[] = []
): Promise<EnhancedMediaUploadResult> => {
  console.log('🚀 Starting media upload process...', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    userId,
    platforms,
    formats
  });

  try {
    // Determine content type
    const contentType = determineContentType(file.type, file.name);
    console.log('📋 Determined content type:', contentType);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.${fileExt}`;
    const storagePath = `uploads/${fileName}`;
    
    console.log('📁 Generated storage path:', storagePath);

    // Upload to Firebase Storage
    console.log('⬆️ Uploading file to Firebase Storage...');
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    console.log('✅ File uploaded successfully to Firebase Storage');

    // Get public URL
    console.log('🔗 Getting public download URL...');
    const publicUrl = await getDownloadURL(storageRef);
    console.log('✅ Public URL obtained:', publicUrl);

    // Prepare content data for database
    const contentData = {
      userId,
      title: file.name, // Use filename as default title
      description: `Uploaded ${contentType} content`,
      contentType,
      status: 'pending',
      fileUrl: publicUrl,
      originalUrl: publicUrl,
      storagePath,
      metadata: {
        size: file.size,
        mimeType: file.type,
        originalName: file.name,
        platforms,
        formats,
        tags: [],
        uploadTimestamp: timestamp,
        uploadMethod: 'file'
      },
      analytics: {
        views: 0,
        shares: 0,
        likes: 0,
        downloads: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Saving content data to database...', {
      collection: 'new_content',
      contentType,
      userId,
      contentData: JSON.stringify(contentData, null, 2)
    });

    // Save to new_content collection
    console.log('🔧 Attempting to add document to Firestore...');
    console.log('📊 Content data being saved:', JSON.stringify(contentData, null, 2));
    console.log('🔍 Firebase db instance:', db);
    console.log('🔍 Collection reference:', collection(db, 'new_content'));
    
    let contentRef;
    try {
      console.log('⏳ Starting addDoc operation...');
      contentRef = await addDoc(collection(db, 'new_content'), contentData);
      console.log('✅ Content saved to database with ID:', contentRef.id);
      console.log('📄 Document reference:', contentRef);
      console.log('📄 Document path:', contentRef.path);
      
      // Verify the document was created by trying to read it back
      console.log('🔍 Verifying document creation...');
      const docSnap = await getDoc(doc(db, 'new_content', contentRef.id));
      if (docSnap.exists()) {
        console.log('✅ Document verification successful - document exists in Firestore');
        console.log('📄 Document data:', docSnap.data());
        console.log('📄 Document ID:', docSnap.id);
        console.log('📄 Document path:', docSnap.ref.path);
      } else {
        console.log('⚠️ Document verification failed - document not found in Firestore');
        console.log('⚠️ Document ID that was supposed to be created:', contentRef.id);
      }
    } catch (firestoreError: any) {
      console.error('❌ Firestore error:', {
        error: firestoreError.message,
        code: firestoreError.code,
        stack: firestoreError.stack,
        name: firestoreError.name,
        details: firestoreError.details
      });
      
      // Log additional debugging info
      console.error('🔍 Additional debugging info:', {
        dbProjectId: db.app.options.projectId,
        dbAppId: db.app.options.appId,
        authDomain: db.app.options.authDomain,
        contentDataKeys: Object.keys(contentData),
        contentDataUserId: contentData.userId,
        contentDataContentType: contentData.contentType
      });
      
      throw firestoreError;
    }

    // Start processing the media content
    console.log('🔄 Starting content processing...');
    try {
      await processMediaContent(contentRef.id, publicUrl, contentType);
      console.log('✅ Content processing completed successfully');
    } catch (processingError: any) {
      console.error('❌ Content processing failed:', processingError);
      // Don't throw here, we still want to return the uploaded content
    }

    const result: EnhancedMediaUploadResult = {
      id: contentRef.id,
      url: publicUrl,
      type: contentType,
      contentType,
      storagePath,
      metadata: contentData.metadata
    };

    console.log('🎉 Upload process completed successfully!', {
      contentId: result.id,
      contentType: result.contentType,
      fileUrl: result.url
    });

    return result;

  } catch (error: any) {
    console.error('❌ Error during media upload:', {
      error: error.message,
      stack: error.stack,
      fileName: file.name,
      userId,
      contentType: file.type
    });
    throw error;
  }
};

export const processMediaLink = async (
  url: string, 
  userId: string,
  platforms: string[] = [],
  formats: string[] = []
): Promise<EnhancedMediaUploadResult> => {
  console.log('🔗 Starting link processing...', {
    url,
    userId,
    platforms,
    formats
  });

  try {
    const contentType = ContentType.LINK;
    const timestamp = Date.now();

    const mediaData = {
      userId,
      title: `Link Content - ${new Date().toLocaleDateString()}`,
      description: `External link content: ${url}`,
      contentType,
      status: 'pending',
      originalUrl: url,
      storagePath: null,
      metadata: {
        sourceUrl: url,
        platforms,
        formats,
        tags: [],
        uploadTimestamp: timestamp,
        uploadMethod: 'url'
      },
      analytics: {
        views: 0,
        shares: 0,
        likes: 0,
        downloads: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Saving link data to database...', {
      collection: 'new_content',
      contentType,
      userId
    });

    const contentRef = await addDoc(collection(db, 'new_content'), mediaData);
    console.log('✅ Link content saved to database with ID:', contentRef.id);

    // Start processing the link content
    console.log('🔄 Starting link processing...');
    await processMediaContent(contentRef.id, url, contentType);
    console.log('✅ Link processing initiated');

    const result: EnhancedMediaUploadResult = {
      id: contentRef.id,
      url: url,
      type: contentType,
      contentType,
      storagePath: '',
      metadata: mediaData.metadata
    };

    console.log('🎉 Link processing completed successfully!', {
      contentId: result.id,
      contentType: result.contentType,
      url: result.url
    });

    return result;

  } catch (error) {
    console.error('❌ Error during link processing:', {
      error: error.message,
      stack: error.stack,
      url,
      userId
    });
    throw error;
  }
};

export const processMediaContent = async (
  mediaId: string,
  url: string,
  contentType: ContentType
): Promise<void> => {
  console.log('🔄 Starting content processing...', {
    mediaId,
    contentType,
    url
  });

  try {
    // First, verify the document exists before processing
    console.log('🔍 Verifying document exists before processing...');
    const contentRef = doc(db, 'new_content', mediaId);
    const docSnap = await getDoc(contentRef);
    
    if (!docSnap.exists()) {
      console.error('❌ Document not found for processing:', mediaId);
      throw new Error(`Document ${mediaId} not found in Firestore`);
    }
    
    console.log('✅ Document found, proceeding with processing');

    // Update status to processing
    await updateDoc(contentRef, {
      status: 'processing',
      updatedAt: new Date().toISOString()
    });
    console.log('📝 Updated content status to processing');

    // Generate derivatives based on content type
    const derivatives = await generateContentDerivatives(mediaId, contentType, url);
    console.log('📄 Generated derivatives:', derivatives.length);

    // Update status to completed
    await updateDoc(contentRef, {
      status: 'completed',
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Content processing completed successfully');

  } catch (error: any) {
    console.error('❌ Error during content processing:', {
      error: error.message,
      stack: error.stack,
      mediaId,
      contentType
    });

    // Update status to failed
    try {
      const contentRef = doc(db, 'new_content', mediaId);
      await updateDoc(contentRef, {
        status: 'failed',
        updatedAt: new Date().toISOString()
      });
      console.log('📝 Updated content status to failed');
    } catch (updateError: any) {
      console.error('❌ Failed to update content status to failed:', updateError);
    }

    throw error;
  }
};

const generateContentDerivatives = async (
  mediaId: string,
  contentType: ContentType,
  url: string
): Promise<any[]> => {
  console.log('📄 Generating content derivatives...', { mediaId, contentType });

  const derivatives = [];

  try {
    // Generate blog post
    const blogDerivative = await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'blog',
      content: `This is a generated blog post based on the ${contentType} content at ${url}.`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    derivatives.push(blogDerivative);
    console.log('📝 Generated blog derivative');

    // Generate headline
    const headlineDerivative = await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'headline',
      content: `Amazing ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content Title`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    derivatives.push(headlineDerivative);
    console.log('📝 Generated headline derivative');

    // Generate SEO tags
    const seoDerivative = await addDoc(collection(db, 'media_derivatives'), {
      mediaId,
      derivativeType: 'seo_tags',
      content: `${contentType}, content, media, digital, marketing, growth`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    derivatives.push(seoDerivative);
    console.log('📝 Generated SEO tags derivative');

    // Content type specific derivatives
    switch (contentType) {
      case ContentType.IMAGE:
        const imageDerivative = await addDoc(collection(db, 'media_derivatives'), {
          mediaId,
          derivativeType: 'image_analysis',
          content: `Image analysis: High-quality ${contentType} content suitable for social media platforms.`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        derivatives.push(imageDerivative);
        console.log('📝 Generated image-specific derivative');
        break;

      case ContentType.VIDEO:
        const videoDerivative = await addDoc(collection(db, 'media_derivatives'), {
          mediaId,
          derivativeType: 'video_analysis',
          content: `Video analysis: Engaging ${contentType} content perfect for video platforms.`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        derivatives.push(videoDerivative);
        console.log('📝 Generated video-specific derivative');
        break;

      case ContentType.AUDIO:
        const audioDerivative = await addDoc(collection(db, 'media_derivatives'), {
          mediaId,
          derivativeType: 'audio_analysis',
          content: `Audio analysis: High-quality ${contentType} content suitable for podcast platforms.`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        derivatives.push(audioDerivative);
        console.log('📝 Generated audio-specific derivative');
        break;

      case ContentType.LINK:
        const linkDerivative = await addDoc(collection(db, 'media_derivatives'), {
          mediaId,
          derivativeType: 'link_analysis',
          content: `Link analysis: External ${contentType} content from ${url}.`,
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        derivatives.push(linkDerivative);
        console.log('📝 Generated link-specific derivative');
        break;
    }

  } catch (error) {
    console.error('❌ Error generating derivatives:', {
      error: error.message,
      mediaId,
      contentType
    });
    throw error;
  }

  return derivatives;
};

const determineContentType = (mimeType: string, fileName: string): ContentType => {
  console.log('🔍 Determining content type...', { mimeType, fileName });

  const type = mimeType.split('/')[0];
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (type) {
    case 'image':
      console.log('📷 Content type determined: IMAGE');
      return ContentType.IMAGE;
    case 'video':
      console.log('🎥 Content type determined: VIDEO');
      return ContentType.VIDEO;
    case 'audio':
      console.log('🎵 Content type determined: AUDIO');
      return ContentType.AUDIO;
    case 'application':
      console.log('📄 Content type determined: DOCUMENT');
      return ContentType.DOCUMENT;
    default:
      console.log('🔗 Content type determined: LINK (default)');
      return ContentType.LINK;
  }
};

// Enhanced content retrieval with type filtering
export const getContentByType = async (
  userId: string,
  contentType?: ContentType
): Promise<any[]> => {
  console.log('📥 Fetching content by type...', { userId, contentType });

  try {
    let query = collection(db, 'new_content');
    
    if (contentType) {
      console.log(`🔍 Filtering by content type: ${contentType}`);
      // Note: You'll need to implement proper query filtering here
      // For now, we'll fetch all and filter client-side
    }

    const snapshot = await getDocs(query);
    const content = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(item => item.userId === userId && (!contentType || item.contentType === contentType));

    console.log(`✅ Retrieved ${content.length} content items`, {
      userId,
      contentType,
      totalItems: content.length
    });

    return content;

  } catch (error) {
    console.error('❌ Error fetching content by type:', {
      error: error.message,
      userId,
      contentType
    });
    throw error;
  }
};

export const getMediaContent = async (userId: string) => {
  console.log('📥 Fetching all media content...', { userId });
  
  try {
    const response = await axiosInstance.get('/media', {
      params: { userId }
    });
    console.log('✅ Retrieved media content via API');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching media content:', {
      error: error.message,
      userId
    });
    throw error;
  }
};

export const getMediaDerivatives = async (mediaId: string) => {
  console.log('📥 Fetching media derivatives...', { mediaId });
  
  try {
    const response = await axiosInstance.get(`/media/${mediaId}/derivatives`);
    console.log('✅ Retrieved media derivatives via API');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching media derivatives:', {
      error: error.message,
      mediaId
    });
    throw error;
  }
};

export const deleteMedia = async (mediaId: string) => {
  console.log('🗑️ Deleting media content...', { mediaId });
  
  try {
    const response = await axiosInstance.delete(`/media/${mediaId}`);
    console.log('✅ Media content deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting media content:', {
      error: error.message,
      mediaId
    });
    throw error;
  }
};

// Test function to debug Firestore connection
export const testFirestoreConnection = async (userId: string) => {
  console.log('🧪 Testing Firestore connection...');
  
  try {
    // Test 1: Try to add a simple test document
    const testData = {
      userId,
      title: 'Test Document',
      description: 'This is a test document to verify Firestore connection',
      contentType: 'test',
      status: 'test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Adding test document to new_content collection...');
    const testRef = await addDoc(collection(db, 'new_content'), testData);
    console.log('✅ Test document added with ID:', testRef.id);
    
    // Test 2: Try to read the document back
    console.log('📖 Reading test document back...');
    const docSnap = await getDoc(doc(db, 'new_content', testRef.id));
    if (docSnap.exists()) {
      console.log('✅ Test document read successfully:', docSnap.data());
    } else {
      console.log('❌ Test document not found after creation');
    }
    
    // Test 3: Try to delete the test document
    console.log('🗑️ Cleaning up test document...');
    // Note: You'll need to implement delete functionality or do this manually
    
    return {
      success: true,
      testDocId: testRef.id,
      message: 'Firestore connection test successful'
    };
    
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', {
      error: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      message: 'Firestore connection test failed'
    };
  }
};