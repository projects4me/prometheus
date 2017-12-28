/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This function is used to retrieve a property in a object
 *
 * @method getProp
 * @param {Object} params[0] data
 * @param {String} params[1] index
 * @return {*} data
 */
export function getProp(params) {
    let data = params[0];
    let index = params[1];

    Logger.debug(data);
    Logger.debug(index);
    if (typeof data.get === 'undefined'){
        if (data[index] !== undefined) {
            Logger.debug(data[index]);
            return data[index];
        } else{
            // Handle more cases in the future
            return '';
        }
    } else {
        return data.get(index);
    }
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
