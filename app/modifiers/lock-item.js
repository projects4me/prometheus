/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';

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
     * Disable pointer events on the parent card while the save overlay is shown.
     * Stores the previous value so willRemove can restore it.
     *
     * @method didInstall
     * @public
     */
    didInstall() {
        this.parent = this.element.parentElement;
        this.previousPointerEvents = this.parent.style.pointerEvents;
        this.parent.style.pointerEvents = "none";
    }

    /**
     * Restore the parent's pointer-events when the overlay is removed so the
     * issue card remains interactive after save completes.
     *
     * @method willRemove
     * @public
     */
    willRemove() {
        if (this.parent) {
            this.parent.style.pointerEvents = this.previousPointerEvents || "";
        }
    }
}
