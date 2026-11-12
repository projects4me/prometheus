/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * This modifier is called during the update of an issue from task board in order
 * to make div unclickable.
 *
 * @example
 *      <div class="item">
 *          <div class="overlay" {{lock-item}}></div>
 *      </div>
 * 
 * @class LockItem
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class LockItemModifier extends Modifier {
    /**
     * Restores the parent's pointer events when the overlay is removed.
     *
     * @method constructor
     * @param {Object} owner
     * @param {Object} args
     */
    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.restorePointerEvents());
    }

    /**
     * Disable pointer events on the parent card while the save overlay is shown.
     * Stores the previous value so restorePointerEvents can restore it.
     *
     * @method modify
     * @param {Element} element
     * @public
     */
    modify(element) {
        if (this.parent) {
            return;
        }
        this.parent = element.parentElement;
        this.previousPointerEvents = this.parent.style.pointerEvents;
        this.parent.style.pointerEvents = "none";
    }

    /**
     * Restore the parent's pointer-events when the overlay is removed so the
     * issue card remains interactive after save completes.
     *
     * @method restorePointerEvents
     * @public
     */
    restorePointerEvents() {
        if (this.parent) {
            this.parent.style.pointerEvents = this.previousPointerEvents || "";
        }
    }
}
