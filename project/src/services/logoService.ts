import { ref, uploadBytes, getDownloadURL, getMetadata } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface LogoData {
  url: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
}

class LogoService {
  private readonly LOGO_PATH = 'logos/gyb-logo.png';

  /**
   * Upload GYB logo to Firebase Storage
   */
  async uploadGYBLogo(file: File): Promise<LogoData> {
    try {
      // Create a reference to the file location
      const logoRef = ref(storage, this.LOGO_PATH);
      
      // Upload the file
      const snapshot = await uploadBytes(logoRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: 'system',
          purpose: 'gyb-brand-logo'
        }
      });

      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get metadata
      const metadata = await getMetadata(snapshot.ref);

      return {
        url: downloadURL,
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType || file.type,
        uploadedAt: new Date(metadata.timeCreated)
      };
    } catch (error) {
      console.error('Error uploading GYB logo:', error);
      throw new Error('Failed to upload GYB logo to Firebase Storage');
    }
  }

  /**
   * Get the GYB logo URL from Firebase Storage
   */
  async getGYBLogoURL(): Promise<string> {
    try {
      const logoRef = ref(storage, this.LOGO_PATH);
      const downloadURL = await getDownloadURL(logoRef);
      return downloadURL;
    } catch (error) {
      console.error('Error getting GYB logo URL:', error);
      // Fallback to the local SVG if Firebase fails
      return '/gyb-logo.svg';
    }
  }

  /**
   * Check if GYB logo exists in Firebase Storage
   */
  async logoExists(): Promise<boolean> {
    try {
      const logoRef = ref(storage, this.LOGO_PATH);
      await getMetadata(logoRef);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const logoService = new LogoService();