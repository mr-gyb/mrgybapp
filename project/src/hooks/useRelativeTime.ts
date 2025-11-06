import { useState, useEffect } from 'react';

/**
 * Hook to format relative time using Intl.RelativeTimeFormat
 * Updates every minute for recent timestamps
 */
export const useRelativeTime = (date: Date | null): string => {
  const [formatted, setFormatted] = useState<string>('');

  useEffect(() => {
    if (!date) {
      setFormatted('just now');
      return;
    }

    const formatTime = () => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      try {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        if (seconds < 60) {
          setFormatted('just now');
        } else if (minutes < 60) {
          setFormatted(rtf.format(-minutes, 'minute'));
        } else if (hours < 24) {
          setFormatted(rtf.format(-hours, 'hour'));
        } else if (days < 7) {
          setFormatted(rtf.format(-days, 'day'));
        } else {
          // For older dates, show absolute date
          const formatter = new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
          });
          setFormatted(formatter.format(date));
        }
      } catch (error) {
        // Fallback if Intl.RelativeTimeFormat not supported
        if (seconds < 60) {
          setFormatted('just now');
        } else if (minutes < 60) {
          setFormatted(`${minutes}m`);
        } else if (hours < 24) {
          setFormatted(`${hours}h`);
        } else if (days < 7) {
          setFormatted(`${days}d`);
        } else {
          const formatter = new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric'
          });
          setFormatted(formatter.format(date));
        }
      }
    };

    formatTime();

    // Update every minute for recent posts
    const now = new Date();
    if (Math.abs(now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000) {
      const interval = setInterval(formatTime, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [date]);

  return formatted;
};

