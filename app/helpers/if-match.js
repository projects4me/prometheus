/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This is a helper function that is used to compare two values
 *
 * @method ifMatch
 * @param {Object} array The object that contains the data
 * @param {String} index The current index which needs evaluation
 * @return {Boolean} isNotLast true if the index is not the last in the array and vice versa
 * @private
 */
export function ifMatch(params) {
    return (params[0] === params[1]);
}

/**
 * The object that provides the ifMatch helper function
 *
 * @class IfMatch
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Helper.helper(ifMatch);