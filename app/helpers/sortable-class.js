/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This is the helper function that is used in the list views in order to get the
 * class name for the sortable rows
 *
 * @method sortableClass
 * @param {String} fieldName The field for which we need the class
 * @param {String} sort The field on which the page is currently sorted
 * @param {String} order The order of the sort
 * @return {String} className The class for this field
 * @private
 */
export function sortableClass(params) {
    let className="sortable";
    if (params[0] === params[1])
    {
        className += ' sortable-'+params[2];
    }
    return className;
}

/**
 * The object that provides the sortableClass helper function
 *
 * @class SortableClass
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(sortableClass);
