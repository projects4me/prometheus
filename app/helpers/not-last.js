/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to format the dates for Handlebars
 *
 * @method notLast
 * @param {Object} array The object that contains the data
 * @param {String} index The current index which needs evaluation
 * @return {Boolean} isNotLast true if the index is not the last in the array and vice versa
 * @private
 */
export function notLast(params) {
    let array = params[0];
    let index = params[1];

    let lastElement = array[Object.keys(array)[Object.keys(array).length - 1]];

    if ((lastElement) == (index)) {
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        Logger.debug(params);
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        Logger.debug('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    }
    return (lastElement) !== (index);
}

/**
 * The object that provides the notLast helper function
 *
 * @class NotLast
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(notLast);