/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * This helper lets us translate the comment markup stored in the database.
 *
 * The current suuport is for `{{}}` mentions with the type user, `>. \n` for list
 * and `\n` converted to <br />
 *
 * No longer necessary as we are now using At.js
 *
 * @method translateComment
 * @param {String} data The comment
 * @return {String} translatedComment The translated comment
 * @todo Handle exception. If possible then make generic
 */
export function translateComment(params) {
    let data = params[0];

    if (data === null)
    {
        data = '';
    }
    
    return htmlSafe(data);
}

/**
 * The object that provides the getWiki helper function
 *
 * @class TranslateComment
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(translateComment);
