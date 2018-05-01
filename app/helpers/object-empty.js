/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to format the dates for Handlebars
 *
 * @method objectEmpty
 * @param {Object} array The object that contains the data
 * @param {String} index The curent index which needs evaluation
 * @return {Boolean} isNotLast true if the index is not the last in the array and vice versa
 * @private
 */
export function objectEmpty(params) {
    let empty = true;

    for (let index in params[0]) { // eslint-disable-line no-unused-vars
        empty = false;
        break;
    }
    return (empty);
}

/**
 * The object that provides the notLast helper function
 *
 * @class NotLast
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(objectEmpty);