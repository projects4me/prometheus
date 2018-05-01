/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * This helper return the border color for a task lane item
 *
 * @method laneitemColor
 * @param {String} issueType The raw HTML
 * @return {String} safeHTML
 */
export function laneitemColor(issueType) {
    let data = issueType[0];
    let opacity;
    if (issueType[1] === undefined) {
        opacity = 1;
    } else {
        opacity = issueType[1];
    }
    let colorHash = new ColorHash();

    let color = colorHash.rgb(data);

    let style = htmlSafe('border-left-color: rgba('+color[0]+', '+color[1]+', '+color[2]+', '+opacity+')');
    return style;
}

/**
 * The object that provides the laneitemColor helper function
 *
 * @class LaneItemColor
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(laneitemColor);
