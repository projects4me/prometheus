/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is a helper function that is used to format the dates for Handlebars
 *
 * @method getDate
 * @param {Object} data The object that contains the date
 * @param {String} index The index on which the data is set
 * @param {String} format Format of the date. Default MMMM Do YYYY, h:mm:ss a
 * @return {String} date Formatted date
 * @private
 */
export function getDate(params) {
    var data = params[0];
    var index = params[1];
    var format = "MMMM Do YYYY, h:mm:ss a";
    if (params[2] !== undefined)
    {
        format = params[2];
    }

    if (data !== undefined)
    {
        return moment(data.get(index)).format(format);
    }
    return false;
}

/**
 * The object that provides the getDate helper function
 *
 * @class GetDate
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(getDate);
