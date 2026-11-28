/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

 /**
 * The reset scroll position is used to scroll to the top of the page.
 *
 * @class ResetScrollPosition
 * @namespace Prometheus.Utils
 * @module Ui
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class PriorityIcon {

    /**
     * This function is used to scroll to the top of the page.
     *
     * @method resetPosition
     * @public
     */
    getClass(priority) {
        let className = '';

        switch (priority) {
            case 'blocker':
                className = 'ban';
                break;
            case 'critical':
                className = 'angle-double-up';
                break;
            case 'high':
                className = 'arrow-up';
                break;
            case 'medium':
                className = 'dot-circle-o';
                break;
            case 'low':
                className = 'arrow-down';
                break;
            case 'lowest':
                className = 'angle-double-down';
                break;
            default:
                break;
        }

        return className;
    }
    
}