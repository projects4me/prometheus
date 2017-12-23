/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This helper is used to get related list
 *
 * @method staticList
 * @param name {String} The list name
 * @return list {Array} The list
 * @todo Not sure if this is used
 */
export function staticList(params) {
    return Ember.String.htmlSafe(params[0]);
}

/**
 * The object that provides the PriorityIcon helper function
 *
 * @class PriorityIcon
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Helper.helper(staticList);
