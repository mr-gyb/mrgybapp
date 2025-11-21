import React, { useEffect, useMemo, useState } from 'react';
import { getAvatarInitials, isValidImageUrl } from '../../utils/avatar';

interface CommunityAvatarProps {
  /**
   * Display name of the author. Used to derive initials when provided.
   */
  name?: string | null;
  /**
   * Email address of the author. Used as a fallback when the display name is missing.
   */
  email?: string | null;
  /**
   * Optional photo URL for the avatar image.
   */
  photoURL?: string | null;
  /**
   * Pixel size of the avatar. Defaults to 40px.
   */
  size?: number;
  /**
   * Additional CSS classes for the wrapper element.
   */
  className?: string;
  /**
   * Optional test id for unit testing.
   */
  'data-testid'?: string;
}

/**
 * CommunityAvatar renders an author's avatar with graceful fallbacks.
 * It attempts to show the provided photo and automatically falls back to
 * derived initials if the photo is missing or fails to load.
 */
const CommunityAvatar: React.FC<CommunityAvatarProps> = ({
  name,
  email,
  photoURL,
  size = 40,
  className = '',
  'data-testid': dataTestId,
}) => {
  const [lastPhotoURL, setLastPhotoURL] = useState<string | null>(photoURL || null);
  const [showFallback, setShowFallback] = useState(() => !isValidImageUrl(photoURL || undefined));

  const initials = useMemo(() => getAvatarInitials(name, email), [name, email]);
  const shouldRenderImage = !showFallback && isValidImageUrl(photoURL || undefined);

  useEffect(() => {
    const normalized = photoURL || null;
    if (normalized !== lastPhotoURL) {
      setLastPhotoURL(normalized);
      setShowFallback(!isValidImageUrl(normalized || undefined));
    }
  }, [photoURL, lastPhotoURL]);

  return (
    <div
      data-testid={dataTestId}
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold uppercase overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      {shouldRenderImage ? (
        <img
          src={photoURL as string}
          alt={name || email || 'User avatar'}
          className="w-full h-full object-cover rounded-full"
          onError={() => setShowFallback(true)}
        />
      ) : (
        <span className="text-sm" aria-hidden="true">
          {initials || 'U'}
        </span>
      )}
    </div>
  );
};

export default CommunityAvatar;

