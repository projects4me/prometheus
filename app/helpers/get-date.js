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
    let data = params[0];
    let index = params[1];
    let format = "MMM d yyyy, h:mm:ss a";

    if (params[2] !== undefined)
    {
        format = params[2];
    }

    if (data.get(index))
    {
        return luxon.DateTime.fromFormat(data.get(index), 'yyyy-LL-dd hh:mm:ss').toFormat(format);
    }
    return '';
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
