/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * The body classes AdminLTE's CSS styles for the sidebar state.
 *
 * @property SIDEBAR_BODY_CLASSES
 * @type Array
 * @final
 */
const SIDEBAR_BODY_CLASSES = ['sidebar-collapse', 'sidebar-expanded-on-hover', 'sidebar-open'];

/**
 * Shows the sidebar state through the body classes AdminLTE's CSS styles: `sidebar-collapse` while the desktop
 * sidebar is collapsed and not expanded by hover, `sidebar-expanded-on-hover` while it is, and `sidebar-open` while
 * the phone sidebar is open. An update only toggles the classes; they are removed when the element goes away.
 *
 * It writes to the body, outside the sidebar's own subtree, only because AdminLTE's layout CSS keys the sidebar,
 * header and content off these body classes. It sits on the layout root (`ApplicationWrapper`), the only writer of these classes. When AdminLTE
 * is replaced (aprom-4999) the state classes move onto the layout root and the body writes go.
 *
 * Usage: `{{sidebar-body-classes collapsed=this.sidebar.collapsed hoverExpanded=this.sidebar.isExpandedOnHover
 * open=this.sidebar.isPhoneOpen}}` with the sidebar service's derived state.
 *
 * @class SidebarBodyClassesModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class SidebarBodyClassesModifier extends Modifier {

    /**
     * The body's class list, set on the first run.
     *
     * @property classes
     * @type DOMTokenList
     * @for SidebarBodyClassesModifier
     * @private
     */
    classes = null;

    /**
     * Toggles the body classes from the state, and on the first run arranges their removal.
     *
     * @method modify
     * @param {HTMLElement} element
     * @param {Array} positional
     * @param {Object} named `collapsed`, `hoverExpanded` and `open`
     * @public
     */
    modify(element, positional, { collapsed, hoverExpanded, open }) {
        if (!this.classes) {
            let classes = (this.classes = element.ownerDocument.body.classList);
            registerDestructor(this, () => classes.remove(...SIDEBAR_BODY_CLASSES));
        }
        this.classes.toggle('sidebar-collapse', Boolean(collapsed && !hoverExpanded));
        this.classes.toggle('sidebar-expanded-on-hover', Boolean(hoverExpanded));
        this.classes.toggle('sidebar-open', Boolean(open));
    }
}
