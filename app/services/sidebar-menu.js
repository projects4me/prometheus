/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isActiveRoute } from 'prometheus/utils/navigation/active-route';

/**
 * Which submenu of the sidebar menu is open, replacing AdminLTE's tree. One submenu is open at a time across the
 * whole menu. Until a submenu is toggled, the active route's item shows its submenu open. While the sidebar is
 * collapsed to its icon strip, where submenus show on hover, toggling does nothing.
 *
 * @class SidebarMenuService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class SidebarMenuService extends Service {

    /**
     * The sidebar service says whether the sidebar is collapsed to its icon strip.
     *
     * @property sidebar
     * @type Ember.Service
     * @for SidebarMenuService
     * @private
     */
    @service sidebar;

    /**
     * The router says which item's route is active.
     *
     * @property router
     * @type Ember.Service
     * @for SidebarMenuService
     * @private
     */
    @service router;

    /**
     * The module whose submenu is open; undefined until a submenu is toggled, null when all are closed.
     *
     * @property openModule
     * @type String|null|undefined
     * @for SidebarMenuService
     * @public
     */
    @tracked openModule;

    /**
     * Whether an item's submenu is open.
     *
     * @method isOpen
     * @param {String} module The navigation module of the item
     * @param {String} route The item's route
     * @return {Boolean}
     * @public
     */
    isOpen = (module, route) => {
        if (this.openModule === undefined) {
            return isActiveRoute(route, this.router.currentRouteName);
        }
        return this.openModule === module;
    };

    /**
     * Opens an item's submenu, closing the open one, or closes it when it is already open.
     *
     * @method toggle
     * @param {String} module The navigation module of the item
     * @param {String} route The item's route
     * @public
     */
    toggle = (module, route) => {
        if (this.sidebar.isMini) {
            return;
        }
        this.openModule = this.isOpen(module, route) ? null : module;
    };
}
