/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import $ from 'jquery';

/**
 * Activates the AdminLTE control sidebar once the sidebar element is in the DOM, and removes the click
 * handler AdminLTE binds on its toggle buttons when the sidebar is torn down.
 *
 * @example
 *  <aside class="control-sidebar" {{activate-control-sidebar}}></aside>
 *
 * @class ActivateControlSidebarModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 */
export default class ActivateControlSidebarModifier extends Modifier {

    /**
     * Whether the sidebar has been activated
     *
     * @property activated
     * @type Boolean
     * @private
     */
    activated = false;

    /**
     * Unbinds the toggle buttons when the modifier is torn down.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.deactivate());
    }

    /**
     * Activates the control sidebar on install.
     *
     * @method modify
     * @public
     */
    modify() {
        let controlSidebar = $.AdminLTE?.controlSidebar;
        if (this.activated || !controlSidebar) {
            return;
        }
        controlSidebar.activate();
        this.activated = true;
    }

    /**
     * Removes the click handler AdminLTE bound on the toggle buttons.
     *
     * @method deactivate
     * @private
     */
    deactivate() {
        if (!this.activated) {
            return;
        }
        $($.AdminLTE.options.controlSidebarOptions.toggleBtnSelector).off('click');
        this.activated = false;
    }
}
