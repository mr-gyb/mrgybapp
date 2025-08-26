/**
 * Validation utilities for content upload and form validation
 */

/**
 * Validates that exactly one platform has been selected
 * @param selectedPlatforms - Array of selected platform names
 * @returns Object with isValid boolean and error message if invalid
 */
export const validatePlatformSelection = (selectedPlatforms: string[]): { isValid: boolean; errorMessage?: string } => {
  if (!selectedPlatforms || selectedPlatforms.length === 0) {
    return {
      isValid: false,
      errorMessage: 'Please select exactly one platform before continuing.'
    };
  }
  
  if (selectedPlatforms.length > 1) {
    return {
      isValid: false,
      errorMessage: 'Please select only one platform. Multiple platform selection is not allowed.'
    };
  }
  
  return { isValid: true };
};

/**
 * Validates content upload data including platform selection
 * @param uploadData - Object containing upload information
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateContentUpload = (uploadData: {
  platforms?: string[];
  category?: any;
  file?: File;
  contentUrl?: string;
  title?: string;
}): { isValid: boolean; errorMessage?: string } => {
  // Check if exactly one platform is selected
  const platformValidation = validatePlatformSelection(uploadData.platforms || []);
  if (!platformValidation.isValid) {
    return platformValidation;
  }

  // Check if file or URL is provided
  if (!uploadData.file && !uploadData.contentUrl?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please provide a file or URL to upload.'
    };
  }

  // Check if title is provided for URL uploads
  if (uploadData.contentUrl?.trim() && !uploadData.title?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please provide a title for your content.'
    };
  }

  return { isValid: true };
};

/**
 * Validates that required fields are filled for content creation
 * @param contentData - Object containing content information
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateContentCreation = (contentData: {
  title?: string;
  platforms?: string[];
  category?: any;
}): { isValid: boolean; errorMessage?: string } => {
  if (!contentData.title?.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please provide a title for your content.'
    };
  }

  const platformValidation = validatePlatformSelection(contentData.platforms || []);
  if (!platformValidation.isValid) {
    return platformValidation;
  }

  if (!contentData.category) {
    return {
      isValid: false,
      errorMessage: 'Please select a content category.'
    };
  }

  return { isValid: true };
};