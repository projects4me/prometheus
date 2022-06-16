/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';

/**
 * This helper return the width in percentage for progress bar
 *
 * @method progressWidth
 * @param {String} width
 * @return {String} safeHTML
 */
export function progressWidth(width) {
  let style = 'width:'+width[0]+'%';
  return htmlSafe(style);
}

/**
 * The object that provides the progressWidth helper function
 *
 * @class ProgressWidth
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(progressWidth);
