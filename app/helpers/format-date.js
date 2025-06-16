/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * Helper to format dates in a consistent way
 * 
 * @function formatDate
 * @param {Array} params - Array containing the date and optional format
 * @param {Object} hash - Hash containing options
 * @return {String} Formatted date string
 */
export function formatDate([date, format], hash = {}) {
  if (!date) {
    return '';
  }

  let dateObj;
  
  // Handle different date input types
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    return '';
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  // Use provided format or default format
  const formatString = format || hash.format || 'short';

  try {
    switch (formatString) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      
      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      
      case 'iso':
        return dateObj.toISOString().split('T')[0];
      
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'datetime':
        return dateObj.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      
      case 'relative':
        return getRelativeTime(dateObj);
      
      default:
        // Try to use the format string as a locale string option
        return dateObj.toLocaleDateString('en-US');
    }
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * 
 * @function getRelativeTime
 * @param {Date} date - The date to compare
 * @return {String} Relative time string
 */
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  } else if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  } else if (Math.abs(diffMinutes) >= 1) {
    return rtf.format(diffMinutes, 'minute');
  } else {
    return rtf.format(diffSeconds, 'second');
  }
}

export default helper(formatDate);
