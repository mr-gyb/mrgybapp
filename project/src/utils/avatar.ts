/**
 * Avatar utilities for community components.
 *
 * Provides helpers to derive consistent initials for a user and to validate
 * remote image URLs before attempting to render them.
 */

/**
 * Returns true when the provided string appears to be a valid http(s) URL.
 */
export const isValidImageUrl = (value?: string | null): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Derives a pair of uppercase initials from a display name.
 *
 * Example:
 *  - "Jane Doe" -> "JD"
 *  - "Mary Ann Doe" -> "JD"
 *  - "Plato" -> "P"
 */
const getInitialsFromDisplayName = (displayName: string): string => {
  if (!displayName.trim()) {
    return '';
  }

  const parts = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? '';
  }

  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
};

/**
 * Derives initials from an email username. The username (portion before "@")
 * is split on ".", "_" or "-" and the first character of the first two segments
 * is used. If the username only contains a single segment, the first two
 * characters are returned.
 */
const getInitialsFromEmail = (email: string): string => {
  const username = email.split('@')[0] || email;
  const tokens = username
    .split(/[._-]+/)
    .map(token => token.trim())
    .filter(Boolean);

  if (tokens.length >= 2) {
    return `${tokens[0][0] ?? ''}${tokens[1][0] ?? ''}`.toUpperCase();
  }

  const [firstToken = ''] = tokens;
  const cleaned = firstToken.replace(/[^a-zA-Z0-9]/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2).toUpperCase();
  }

  if (cleaned.length === 1) {
    return cleaned.toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
};

/**
 * Computes user initials from a display name or email address following the
 * product specification:
 *   1. Use the display name when available (first + last initials).
 *   2. Fallback to the email username split on ".", "_" or "-".
 *   3. Default to "U" when no signal is available.
 */
export const getInitials = (nameOrEmail?: string | null): string => {
  if (!nameOrEmail) {
    return 'U';
  }

  const trimmed = nameOrEmail.trim();
  if (!trimmed) {
    return 'U';
  }

  if (trimmed.includes(' ') && !trimmed.includes('@')) {
    const fromName = getInitialsFromDisplayName(trimmed);
    return fromName || 'U';
  }

  if (trimmed.includes('@')) {
    const fromEmail = getInitialsFromEmail(trimmed);
    return fromEmail || 'U';
  }

  // Treat single word values as names.
  const fromName = getInitialsFromDisplayName(trimmed);
  return fromName || trimmed.slice(0, 2).toUpperCase() || 'U';
};

/**
 * Convenience helper that prioritises a display name but falls back to an
 * email address when deriving initials.
 */
export const getAvatarInitials = (displayName?: string | null, email?: string | null): string => {
  const fromName = displayName ? getInitials(displayName) : '';
  if (fromName && fromName !== 'U') {
    return fromName;
  }

  return getInitials(email || displayName || '');
};

