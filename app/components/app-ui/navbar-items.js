/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
*/

import Component from '@glimmer/component';
import { service } from '@ember/service';

/**
 * Renders the navbar items.
 *
 * An item (or a sub-item in its actions) is scoped by its metadata flags: `workspaceRelated` links to
 * `<anchorRoute>/<workspace short code>`, `projectRelated` to `project/<project short code>/<anchorRoute>`, and
 * anything else to `<anchorRoute>`. The short codes come from `@trackedProject`. Which submenu is open comes from
 * the `sidebar-menu` service.
 *
 * @class AppUiNavbarItemsComponent
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiNavbarItemsComponent extends Component {

    /**
     * Which submenu is open, one at a time across the sidebar menu.
     *
     * @property sidebarMenu
     * @type Ember.Service
     * @for AppUiNavbarItemsComponent
     * @private
     */
    @service sidebarMenu;

    /**
     * Returns the href of a navigation item from its scope flags and the tracked short codes.
     *
     * @method hrefFor
     * @param {Object} item The item or sub-item metadata
     * @return {String}
     * @public
     */
    hrefFor = (item) => {
        let prefix = this.args.appPrefix;
        if (item.workspaceRelated) {
            return `/${prefix}/${item.anchorRoute}/${this.args.trackedProject?.workspaceShortCode ?? ''}`;
        }
        if (item.projectRelated) {
            return `/${prefix}/project/${this.args.trackedProject?.shortCode ?? ''}/${item.anchorRoute}`;
        }
        return `/${prefix}/${item.anchorRoute}`;
    };

    /**
     * Whether an item is shown disabled: a project item while no project is selected (`@disabled`), or a
     * workspace item while the selected project's workspace is not known.
     *
     * @method isDisabled
     * @param {Object} definition The item metadata
     * @return {Boolean}
     * @public
     */
    isDisabled = (definition) => {
        if (this.args.disabled && definition.projectRelated) {
            return true;
        }
        return Boolean(definition.workspaceRelated && !this.args.trackedProject?.workspaceShortCode);
    };
}
