/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';

/**
 * This function is used to retrieve a color for the
 * passed string
 *
 * @method getColor
 * @param {String} data
 * @param {Float} opacity
 * @return {String} color
 */
export function getColor(params) {
    let data = params[0];
    let opacity;
    if (params[1] === undefined) {
        opacity = 1;
    } else {
        opacity = params[1];
    }
    let colorHash = new ColorHash();

    let color = colorHash.rgb(data);
    return 'rgba('+color[0]+', '+color[1]+', '+color[2]+', '+opacity+')';
}

/**
 * This is the object that provides access to the function getColor
 *
 * @class GetColor
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gamilcom
 * @deprecated
 */
export default helper(getColor);
