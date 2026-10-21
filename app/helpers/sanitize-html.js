/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import sanitizeHtml from 'prometheus/utils/sanitize-html';

/**
 * Renders stored html after sanitizing it, never raw
 *
 * @method sanitize-html
 * @param {Array} params the html
 * @returns {SafeString}
 */
export default helper(function sanitizeHtmlHelper([html]) {
    return htmlSafe(sanitizeHtml(html));
});
