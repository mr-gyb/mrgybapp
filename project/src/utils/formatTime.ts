/**
 * Format timestamp to "time ago" format
 * Simple implementation without date-fns dependency
 */

export const formatTimeAgo = (timestamp: Date | null): string => {
  if (!timestamp) return 'Just now';

  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
  if (months > 0) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  if (weeks > 0) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (days > 0) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (minutes > 0) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (seconds > 0) {
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  }

  return 'Just now';
};

