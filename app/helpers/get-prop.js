/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This function is used to retrieve a property in a object
 *
 * @method getProp
 * @param {Object} data
 * @param {String} index
 * @return {*} data
 */
export function getProp(params) {
    var data = params[0];
    var index = params[1];
    return data.get(index);
}

/**
 * This is the object that provides access to the function getProp
 *
 * @class GetProp
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gamilcom
 * @deprecated
 */
export default Ember.Helper.helper(getProp);
