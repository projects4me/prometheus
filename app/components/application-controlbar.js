/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * Application control sidebar (AdminLTE). The sidebar itself is activated by the activate-control-sidebar
 * modifier.
 *
 * @class ApplicationControlbar
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ApplicationControlbarComponent extends Component {

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for ApplicationControlbar
     */
    @service currentUser;

    /**
     * The online users listed in the sidebar (none are loaded yet)
     *
     * @property users
     * @type Array
     * @for ApplicationControlbar
     */
    users = [];
}
