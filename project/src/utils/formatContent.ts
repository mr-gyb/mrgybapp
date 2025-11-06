/**
 * Format content with auto-linking URLs and preserving line breaks
 * Simple regex-based URL detection and linking
 * Returns HTML string that can be rendered with dangerouslySetInnerHTML
 */

export const formatContentWithLinks = (content: string): string => {
  if (!content) return '';
  
  // First, escape HTML to prevent XSS
  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  // Escape the content first
  let formatted = escapeHtml(content);

  // Preserve line breaks
  formatted = formatted.replace(/\n/g, '<br />');

  // URL regex pattern - matches http:// or https:// URLs
  const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
  
  // Replace URLs with anchor tags
  formatted = formatted.replace(urlRegex, (url) => {
    // Trim trailing punctuation that might not be part of URL
    const cleanUrl = url.replace(/[.,;!?]+$/, '');
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline break-all">${cleanUrl}</a>`;
  });

  return formatted;
};

/**
 * Validate if a string is a valid HTTP/HTTPS image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // Must be HTTP or HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check for common image extensions (optional check)
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    return imageExtensions.test(urlObj.pathname) || urlObj.pathname === '/';
  } catch {
    return false;
  }
};


