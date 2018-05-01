/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * This helper parses HTML strings for security reasons
 *
 * @method safeHTML
 * @param {String} HTML The raw HTML
 * @return {String} safeHTML
 */
export function safeHtml(HTML) {
    return htmlSafe(HTML[0]);
}

/**
 * The object that provides the safeHTML helper function
 *
 * @class SafeHTML
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(safeHtml);
