/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { SETTINGS_NAVIGATION } from 'prometheus/utils/settings/navigation';

/**
 * Resolves the Settings side navigation for the current user: the groups and
 * pages they are allowed to see, and the first page to land on.
 *
 * @class SettingsNavigationService
 * @namespace Prometheus.Services
 * @extends Service
 */
export default class SettingsNavigationService extends Service {

    /**
     * The acl service used to filter pages by permission.
     *
     * @property acl
     * @type Ember.Service
     * @private
     */
    @service acl;

    /**
     * The navigation groups containing only the pages the user can access.
     * Groups left without pages are dropped.
     *
     * @method groups
     * @returns {Array}
     * @public
     */
    get groups() {
        return SETTINGS_NAVIGATION
            .map(group => ({
                ...group,
                items: group.items.filter(item => this.acl.checkAccess(item.aclContext))
            }))
            .filter(group => group.items.length > 0);
    }

    /**
     * The route of the first page the user can see, or null when there is none.
     *
     * @method firstRoute
     * @returns {String|null}
     * @public
     */
    get firstRoute() {
        let group = this.groups[0];
        return group ? group.items[0].route : null;
    }
}
