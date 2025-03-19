import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

/**
 * A template helper that marks a string as HTML safe to prevent escaping.
 * 
 * @method htmlSafeHelper
 * @param {String} string - The string to mark as HTML safe
 * @return {SafeString} The HTML safe string that can be rendered without escaping
 * @example
 * {{html-safe "<strong>Bold text</strong>"}}
 */
export default helper(function htmlSafeHelper([string]) {
  return htmlSafe(string);
});
