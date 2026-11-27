/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

/**
 * The localStorage key that keeps the desktop collapsed preference across sessions.
 *
 * @property SIDEBAR_STORAGE_KEY
 * @type String
 * @final
 */
export const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed';

/**
 * State of the main navigation sidebar, replacing AdminLTE's push menu.
 *
 * On desktop (768px and wider) the sidebar is `collapsed` to its icon strip or expanded, and the choice is kept in
 * localStorage. On phones it slides in over the page: `open`. While collapsed on desktop, hovering the sidebar
 * expands it for as long as the pointer stays over it (`hoverExpanded`), as AdminLTE's sidebar-mini did.
 *
 * The state is shown through the body classes AdminLTE's CSS already styles: `sidebar-collapse`, `sidebar-open`
 * and `sidebar-expanded-on-hover`.
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
     * Restores the persisted collapsed preference and applies it to the body.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.collapsed = readCollapsed();
        this.applyBodyClasses();
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
        return !this.viewport.isPhone && this.collapsed && !this.hoverExpanded;
    }

    /**
     * The header toggle: collapses or expands the sidebar on desktop, opens or closes it on phones.
     *
     * @method toggle
     * @public
     */
    toggle = () => {
        if (this.viewport.isPhone) {
            this.open = !this.open;
        } else {
            this.collapsed = !this.isMini;
            this.hoverExpanded = false;
            writeCollapsed(this.collapsed);
        }
        this.applyBodyClasses();
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
            this.applyBodyClasses();
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
            this.applyBodyClasses();
        }
    };

    /**
     * The pointer left the sidebar: a sidebar expanded by hover collapses again.
     *
     * @method hoverEnd
     * @public
     */
    hoverEnd = () => {
        if (this.hoverExpanded && !this.viewport.isPhone) {
            this.hoverExpanded = false;
            this.applyBodyClasses();
        }
    };

    /**
     * Sets the body classes AdminLTE's CSS styles from the current state.
     *
     * @method applyBodyClasses
     * @private
     */
    applyBodyClasses() {
        let classes = document.body.classList;
        classes.toggle('sidebar-collapse', this.collapsed && !this.hoverExpanded);
        classes.toggle('sidebar-expanded-on-hover', this.hoverExpanded);
        classes.toggle('sidebar-open', this.open);
    }

    /**
     * Removes the body classes, so a destroyed app (tests) leaves the page as it found it.
     *
     * @method willDestroy
     * @public
     */
    willDestroy() {
        super.willDestroy(...arguments);
        document.body.classList.remove('sidebar-collapse', 'sidebar-expanded-on-hover', 'sidebar-open');
    }
}

/**
 * Reads the persisted collapsed preference; storage that can't be read means expanded.
 *
 * @method readCollapsed
 * @return {Boolean}
 * @private
 */
function readCollapsed() {
    try {
        return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

/**
 * Persists the collapsed preference; storage that can't be written is ignored.
 *
 * @method writeCollapsed
 * @param {Boolean} collapsed
 * @private
 */
function writeCollapsed(collapsed) {
    try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
        // Private mode or full storage: the preference just isn't kept.
    }
}
