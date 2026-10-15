/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * The grouped side navigation of the Settings area. Renders the pages the
 * current user may see and highlights the active one.
 *
 * @class SettingsNavComponent
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class SettingsNavComponent extends Component {

    /**
     * Provides the ACL-filtered navigation groups.
     *
     * @property settingsNavigation
     * @type Ember.Service
     * @private
     */
    @service settingsNavigation;

    /**
     * The groups to render; defaults to the user's visible settings groups.
     *
     * @property groups
     * @type Array
     * @public
     */
    get groups() {
        return this.args.groups ?? this.settingsNavigation.groups;
    }
}
