/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';
import MD from "../utils/metadata/metadata";

/**
 * This is a helper function that is used get the icon for the nav item
 *
 * @method navIcon
 * @param {Object} array The object that contains the data
 * @param {String} index The current index which needs evaluation
 * @return {Boolean} isNotLast true if the index is not the last in the array and vice versa
 * @private
 */
export function navIcon(params) {
    let metaData = MD.create().getViewMeta('Navigation','items');
    let navModule = Ember.String.capitalize(params[0]);
    if (navModule === 'App') {
        navModule = 'Dashboard';
    } else if (navModule === 'Projects') {
        navModule = 'Project';
    }
    if (metaData[navModule] !== undefined)
    {
        return metaData[navModule].icon;
    }
    return '';
}

/**
 * The object that provides the navIcon helper function
 *
 * @class NavIcon
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Helper.helper(navIcon);
