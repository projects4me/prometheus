/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render priority icon of issue
 *
 * @class PriorityIcon
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class PriorityIconComponent extends Component {

    /**
     * This function returns the priority of issue
     *
     * @method get
     * @public
     */
    get priority() {
        return this.args.priority;
    }

    /**
     * This function returns CSS class against the priority of the issue.
     * That class will be used in HTML element in order to show priority icon.
     *
     * @method get
     * @public
     */
    get getClassName() {
        let priority = this.priority;
        let className = '';

        switch (priority) {
            case 'blocker':
                className = 'fa-ban';
                break;
            case 'critical':
                className = 'fa-angle-double-up';
                break;
            case 'high':
                className = 'fa-arrow-up';
                break;
            case 'medium':
                className = 'fa-dot-circle-o';
                break;
            case 'low':
                className = 'fa-arrow-down';
                break;
            case 'lowest':
                className = 'fa-angle-double-down';
                break;
            default:
                break;
        }

        return className;
    }
}
