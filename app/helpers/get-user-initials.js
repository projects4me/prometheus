/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * Helper to get user initials from user object
 * 
 * @function getUserInitials
 * @param {Array} params - Array containing the user object
 * @return {String} User initials (e.g., "JD" for "John Doe")
 */
export function getUserInitials([user]) {
  if (!user) {
    return '';
  }

  let name = '';
  
  // Try to get name from different possible properties
  if (user.get('name')) {
    name = user.get('name');
  } else if (user.get && user.get('name')) {
    name = user.get('name');
  } else if (user.username) {
    name = user.username;
  } else if (user.get && user.get('username')) {
    name = user.get('username');
  } else {
    return '';
  }

  // Split name into parts and get first letter of each part
  const nameParts = name.trim().split(/\s+/);
  
  if (nameParts.length === 1) {
    // Single name, return first two characters
    return nameParts[0].substring(0, 2).toUpperCase();
  } else {
    // Multiple parts, return first letter of first two parts
    return nameParts
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}

export default helper(getUserInitials);
