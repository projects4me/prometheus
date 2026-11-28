/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * State of the main navigation sidebar, replacing AdminLTE's push menu.
 *
 * On desktop (768px and wider) the sidebar is `collapsed` to its icon strip or expanded, and the choice is kept in
 * localStorage. On phones it slides in over the page: `open`. While collapsed on desktop, hovering the sidebar
 * expands it for as long as the pointer stays over it (`hoverExpanded`), as AdminLTE's sidebar-mini did.
 *
 * The service holds the state only: the preference is kept by the `sidebar-preference` service, and the
 * `sidebar-body-classes` modifier shows the state through the body classes AdminLTE's CSS styles.
 *
 * @class SidebarService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class SidebarService extends Service {

    /**
     * The viewport service says whether the screen is a phone.
     *
     * @property viewport
     * @type Ember.Service
     * @for SidebarService
     * @private
     */
    @service viewport;

    /**
     * Whether the desktop sidebar is collapsed to its icon strip (persisted).
     *
     * @property collapsed
     * @type Boolean
     * @for SidebarService
     * @public
     */
    @tracked collapsed = false;

    /**
     * Whether the phone sidebar is open over the page.
     *
     * @property open
     * @type Boolean
     * @for SidebarService
     * @public
     */
    @tracked open = false;

    /**
     * Whether the collapsed desktop sidebar is expanded while the pointer is over it.
     *
     * @property hoverExpanded
     * @type Boolean
     * @for SidebarService
     * @public
     */
    @tracked hoverExpanded = false;

    /**
     * Keeps the desktop collapsed preference across sessions.
     *
     * @property sidebarPreference
     * @type Ember.Service
     * @for SidebarService
     * @private
     */
    @service sidebarPreference;

    /**
     * Restores the persisted collapsed preference.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.collapsed = this.sidebarPreference.read();
    }

    /**
     * Whether the sidebar shows only its icon strip right now: collapsed on desktop and not expanded by hover.
     *
     * @property isMini
     * @type Boolean
     * @for SidebarService
     * @public
     */
    get isMini() {
        return !this.viewport.isPhone && this.collapsed && !this.isExpandedOnHover;
    }

    /**
     * Whether the phone sidebar shows open: `open` counts only while the screen is a phone, so a window widened
     * past 768px with the phone sidebar open shows the desktop sidebar.
     *
     * @property isPhoneOpen
     * @type Boolean
     * @for SidebarService
     * @public
     */
    get isPhoneOpen() {
        return this.open && this.viewport.isPhone;
    }

    /**
     * Whether the collapsed desktop sidebar shows expanded by hover: `hoverExpanded` counts only on desktop.
     *
     * @property isExpandedOnHover
     * @type Boolean
     * @for SidebarService
     * @public
     */
    get isExpandedOnHover() {
        return this.hoverExpanded && !this.viewport.isPhone;
    }

    /**
     * The header toggle: flips the desktop collapsed preference, or opens or closes the sidebar on phones. A
     * collapsed sidebar that is expanded by hover counts as collapsed, so the toggle keeps it expanded.
     *
     * @method toggle
     * @public
     */
    toggle = () => {
        if (this.viewport.isPhone) {
            this.open = !this.isPhoneOpen;
        } else {
            this.open = false;
            this.collapsed = !this.collapsed;
            this.hoverExpanded = false;
            this.sidebarPreference.write(this.collapsed);
        }
    };

    /**
     * Closes the phone sidebar. The desktop collapsed state is never touched.
     *
     * @method close
     * @public
     */
    close = () => {
        if (this.open) {
            this.open = false;
        }
    };

    /**
     * The pointer entered the sidebar: a collapsed desktop sidebar expands while it stays.
     *
     * @method hoverStart
     * @public
     */
    hoverStart = () => {
        if (this.isMini) {
            this.hoverExpanded = true;
        }
    };

    /**
     * The pointer left the sidebar: a sidebar expanded by hover collapses again, whatever the screen is now.
     *
     * @method hoverEnd
     * @public
     */
    hoverEnd = () => {
        if (this.hoverExpanded) {
            this.hoverExpanded = false;
        }
    };
}
