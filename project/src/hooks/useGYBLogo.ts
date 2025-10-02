import { useState, useEffect } from 'react';
import { logoService } from '../services/logoService';
import { generateGYBLogoSVG, svgToPng, blobToFile } from '../utils/logoConverter';

export interface LogoState {
  url: string | null;
  loading: boolean;
  error: string | null;
  isUploaded: boolean;
}

export const useGYBLogo = () => {
  const [logoState, setLogoState] = useState<LogoState>({
    url: null,
    loading: true,
    error: null,
    isUploaded: false
  });

  /**
   * Upload the GYB logo to Firebase Storage
   */
  const uploadLogo = async () => {
    try {
      setLogoState(prev => ({ ...prev, loading: true, error: null }));

      // Generate SVG string
      const svgString = generateGYBLogoSVG();
      
      // Convert SVG to PNG
      const pngBlob = await svgToPng(svgString, 120, 120);
      
      // Convert Blob to File
      const logoFile = blobToFile(pngBlob, 'gyb-logo.png', 'image/png');
      
      // Upload to Firebase
      const logoData = await logoService.uploadGYBLogo(logoFile);
      
      setLogoState({
        url: logoData.url,
        loading: false,
        error: null,
        isUploaded: true
      });

      return logoData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
      setLogoState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  };

  /**
   * Load the GYB logo from Firebase Storage
   */
  const loadLogo = async () => {
    try {
      setLogoState(prev => ({ ...prev, loading: true, error: null }));

      // Check if logo exists in Firebase
      const exists = await logoService.logoExists();
      
      if (exists) {
        // Get the URL from Firebase
        const url = await logoService.getGYBLogoURL();
        setLogoState({
          url,
          loading: false,
          error: null,
          isUploaded: true
        });
      } else {
        // Fallback to local SVG
        setLogoState({
          url: '/gyb-logo.svg',
          loading: false,
          error: null,
          isUploaded: false
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load logo';
      setLogoState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        url: '/gyb-logo.svg' // Fallback
      }));
    }
  };

  /**
   * Initialize logo on component mount
   */
  useEffect(() => {
    loadLogo();
  }, []);

  return {
    ...logoState,
    uploadLogo,
    loadLogo
  };
};
