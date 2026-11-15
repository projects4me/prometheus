/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Reports the width of the element it is set on, now and whenever it changes: `{{observe-width this.onWidth}}`.
 * The observer is removed when the element is torn down, and nothing happens where ResizeObserver is missing.
 *
 * @namespace Prometheus.Modifiers
 */
export default class ObserveWidthModifier extends Modifier {
    observer = null;

    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.stop());
    }

    modify(element, [callback]) {
        this.stop();
        if (typeof ResizeObserver !== 'function' || typeof callback !== 'function') {
            return;
        }
        this.observer = new ResizeObserver((entries) => {
            let entry = entries[entries.length - 1];
            callback(entry?.contentRect?.width ?? element.getBoundingClientRect().width);
        });
        this.observer.observe(element);
    }

    stop() {
        this.observer?.disconnect();
        this.observer = null;
    }
}
