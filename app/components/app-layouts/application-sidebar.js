/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * The main navigation sidebar. While it is collapsed on desktop, hovering it expands it through the sidebar service.
 *
 * @class ApplicationSidebar
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class ApplicationSidebarComponent extends Component {

    /**
     * The sidebar service holds the collapsed, open and hover-expanded state.
     *
     * @property sidebar
     * @type Ember.Service
     * @for ApplicationSidebar
     * @public
     */
    @service sidebar;
}
