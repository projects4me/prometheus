/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * Helper to convert an object to CSS style string
 * 
 * @function objectToStyle
 * @param {Array} params - Array containing the style object
 * @return {String} CSS style string
 */
export function objectToStyle([styleObj]) {
  if (!styleObj || typeof styleObj !== 'object') {
    return '';
  }

  return Object.entries(styleObj)
    .filter(([key, value]) => value !== null && value !== undefined)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssProperty = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value}`;
    })
    .join('; ');
}

export default helper(objectToStyle);
