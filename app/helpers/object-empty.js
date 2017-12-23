/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

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
    var empty = true;
    for(var index in params[0])
    {
        empty = false;
        // Just to get rid of the jshint
        index = index;
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
export default Ember.Helper.helper(objectEmpty);