/**
 * Utility functions for converting and handling logo images
 */

/**
 * Convert SVG string to PNG Blob
 */
export async function svgToPng(svgString: string, width: number = 120, height: number = 120): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = width;
    canvas.height = height;
    
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert SVG to PNG'));
          }
        }, 'image/png');
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    
    // Convert SVG string to data URL
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  });
}

/**
 * Generate the GYB logo SVG string
 */
export function generateGYBLogoSVG(): string {
  return `
    <svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer Circle with Golden Border -->
      <circle
        cx="60"
        cy="60"
        r="58"
        fill="none"
        stroke="#e3c472"
        stroke-width="4"
      />
      
      <!-- Inner Black Circle -->
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="#000000"
      />
      
      <!-- GYB. Text -->
      <text
        x="60"
        y="65"
        text-anchor="middle"
        fill="#e3c472"
        font-size="28"
        font-weight="bold"
        font-family="serif"
        letter-spacing="2px"
      >
        GYB.
      </text>
      
      <!-- GROW YOUR BUSINESS Text - Following the curve -->
      <path
        id="curve"
        d="M 20 60 A 40 40 0 1 1 100 60"
        fill="none"
      />
      <text
        font-size="8"
        fill="#e3c472"
        font-family="sans-serif"
        font-weight="600"
        letter-spacing="1px"
      >
        <textPath href="#curve" startOffset="50%">
          GROW YOUR BUSINESS
        </textPath>
      </text>
    </svg>
  `;
}

/**
 * Create a File object from Blob
 */
export function blobToFile(blob: Blob, filename: string, mimeType: string): File {
  return new File([blob], filename, { type: mimeType });
}
