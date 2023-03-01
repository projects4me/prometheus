/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * This component is used to render the application sidebar
 *
 * @class ApplicationSidebar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ApplicationSidebarComponent extends Component {

    /**
     * This function returns list of projects
     *
     * @method get
     * @public
     */
    get projectList() {
        return this.args.projectList ?? '';
    }

}
