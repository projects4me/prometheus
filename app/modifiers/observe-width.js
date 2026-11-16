/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';

/**
 * Reports the width of the element it is set on, now and whenever it changes: `{{observe-width this.onWidth}}`.
 * With `parent=true` it reports the content width of the element's parent instead, for an element that adapts to
 * the space it is given and so must not measure itself. Without a callback nothing is observed.
 * The observer is removed when the element is torn down, and nothing happens where ResizeObserver is missing.
 *
 * The callback runs in the next animation frame, not inside the ResizeObserver notification. A callback that
 * re-renders (a narrow mode, say) would otherwise resize observed elements in the same frame, and the browser
 * reports that as "ResizeObserver loop completed with undelivered notifications".
 *
 * @namespace Prometheus.Modifiers
 */
export default class ObserveWidthModifier extends Modifier {
    observer = null;
    frame = null;

    constructor(owner, args) {
        super(owner, args);
        registerDestructor(this, () => this.stop());
    }

    modify(element, [callback], { parent = false } = {}) {
        this.stop();
        let target = parent ? element.parentElement : element;
        if (typeof ResizeObserver !== 'function' || typeof callback !== 'function' || !target) {
            return;
        }
        this.observer = new ResizeObserver((entries) => {
            let entry = entries[entries.length - 1];
            let width = entry?.contentRect?.width ?? target.getBoundingClientRect().width;
            this.cancelFrame();
            this.frame = requestAnimationFrame(() => {
                this.frame = null;
                callback(width);
            });
        });
        this.observer.observe(target);
    }

    cancelFrame() {
        if (this.frame !== null) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }
    }

    stop() {
        this.cancelFrame();
        this.observer?.disconnect();
        this.observer = null;
    }
}
