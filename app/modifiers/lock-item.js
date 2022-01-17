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
 * @author Rana Nouman <ranamnouman@yahoo.com>
 */
export default class LockItemModifier extends Modifier {
    didInstall() {
        this.element.parentElement.style.pointerEvents = "none";
    }
}
