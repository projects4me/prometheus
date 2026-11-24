/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Milliseconds the pointer must stay over a collapsed lane before the lane opens.
 *
 * @property PEEK_DELAY
 * @type {Number}
 * @final
 */
export const PEEK_DELAY = 300;

/**
 * The class that shows a collapsed lane at full width while a card is dragged over it.
 *
 * @property PEEK_CLASS
 * @type {String}
 * @final
 */
export const PEEK_CLASS = 'lane-peek';

/**
 * Opens a collapsed task board lane while a card is dragged over it, so the card drops into the lane's own card
 * area, and collapses it again when the pointer leaves the lane or the drag ends.
 *
 * The board drags with SortableJS's forceFallback, so there are no HTML5 dragover events: the pointer is tracked
 * with pointermove on the document and the lane under it is found with elementFromPoint. Peeking only adds a
 * transient class; it never changes the saved collapsed lanes.
 *
 * @class LanePeek
 * @namespace Prometheus.Utils.Ui
 */
export default class LanePeek {
    /**
     * @method constructor
     * @param {Object} [options]
     * @param {Document} [options.document] the document to track the pointer on
     * @param {Number} [options.delay] milliseconds before a hovered collapsed lane opens
     */
    constructor({ document: doc = document, delay = PEEK_DELAY } = {}) {
        this.document = doc;
        this.delay = delay;
        this.pendingLane = null;
        this.timer = null;
        this.peeked = new Set();
        this.active = false;
        this._onPointerMove = (evt) => this.track(evt.clientX, evt.clientY);
    }

    /**
     * Starts tracking the pointer; called when a drag starts.
     *
     * @method start
     */
    start() {
        if (this.active) {
            return;
        }
        this.active = true;
        this.document.addEventListener('pointermove', this._onPointerMove);
    }

    /**
     * Stops tracking, clears the pending timer and collapses every peeked lane; called when a drag ends and on
     * teardown.
     *
     * @method stop
     */
    stop() {
        this.active = false;
        this.document.removeEventListener('pointermove', this._onPointerMove);
        this._cancelPending();
        this.peeked.forEach((lane) => lane.classList.remove(PEEK_CLASS));
        this.peeked.clear();
    }

    /**
     * Handles one pointer position: collapses peeked lanes the pointer has left, and opens a collapsed lane after
     * the pointer has stayed over it for the delay.
     *
     * @method track
     * @param {Number} x
     * @param {Number} y
     */
    track(x, y) {
        this.peeked.forEach((lane) => {
            if (!this._contains(lane, x, y)) {
                lane.classList.remove(PEEK_CLASS);
                this.peeked.delete(lane);
            }
        });

        let lane = this._collapsedLaneAt(x, y);
        if (lane === this.pendingLane) {
            return;
        }
        this._cancelPending();
        if (!lane || this.peeked.has(lane)) {
            return;
        }
        this.pendingLane = lane;
        this.timer = setTimeout(() => {
            this.timer = null;
            this.pendingLane = null;
            if (this.active && lane.isConnected) {
                lane.classList.add(PEEK_CLASS);
                this.peeked.add(lane);
            }
        }, this.delay);
    }

    /**
     * The collapsed lane under a point, or null.
     *
     * @method _collapsedLaneAt
     * @param {Number} x
     * @param {Number} y
     * @return {HTMLElement|null}
     * @private
     */
    _collapsedLaneAt(x, y) {
        let el = this.document.elementFromPoint(x, y);
        return el ? el.closest('.lane.lane-collapsed') : null;
    }

    /**
     * Whether a point is inside a lane's current box.
     *
     * @method _contains
     * @param {HTMLElement} lane
     * @param {Number} x
     * @param {Number} y
     * @return {Boolean}
     * @private
     */
    _contains(lane, x, y) {
        let rect = lane.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    /**
     * Clears the timer of a lane that has not opened yet.
     *
     * @method _cancelPending
     * @private
     */
    _cancelPending() {
        clearTimeout(this.timer);
        this.timer = null;
        this.pendingLane = null;
    }
}
