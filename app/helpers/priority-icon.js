/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

/**
 * This helper is used to get the icon for the priorityIcon
 *
 * @method PriorityIcon
 * @param priority {String} The priority for which we need the icon
 * @return HTML {String} The HTML of the font-awesome icon
 * @todo Optimize
 */
export function priorityIcon(params) {
    let HTML = '';
    switch (params[0]) {
        case 'blocker':
            HTML += '<i class="fa fa-ban"></i>';
            break;
        case 'critical':
            HTML += '<i class="fa fa-angle-double-up"></i>';
            break;
        case 'high':
            HTML += '<i class="fa fa-arrow-up"></i>';
            break;
        case 'medium':
            HTML += '<i class="fa fa-dot-circle-o"></i>';
            break;
        case 'low':
            HTML += '<i class="fa fa-arrow-down"></i>';
            break;
        case 'lowest':
            HTML += '<i class="fa fa-angle-double-down"></i>';
            break;
        default:
            break;
    }

    return htmlSafe(HTML);
}

/**
 * The object that provides the PriorityIcon helper function
 *
 * @class PriorityIcon
 * @namespace Prometheus.Helpers
 * @extends Ember.Helper.helper
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default helper(priorityIcon);