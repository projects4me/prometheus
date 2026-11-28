/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * The layout root of the signed-in app (AdminLTE's `.wrapper`). It shows the sidebar state to AdminLTE's layout CSS
 * through the `sidebar-body-classes` modifier.
 *
 * @class ApplicationWrapper
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class ApplicationWrapperComponent extends Component {

    /**
     * The sidebar service whose state the layout shows.
     *
     * @property sidebar
     * @type Ember.Service
     * @for ApplicationWrapper
     * @private
     */
    @service sidebar;
}
