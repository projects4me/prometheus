/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';

/**
 * The pan and zoom of the workflow canvas: a screen point is a canvas point times the scale, plus the offset.
 *
 * @class Viewport
 * @namespace Prometheus.Utils.Workflow
 */
export default class Viewport {
    /**
     * @property MIN_SCALE
     * @type Number
     * @static
     */
    static MIN_SCALE = 0.25;

    /**
     * @property MAX_SCALE
     * @type Number
     * @static
     */
    static MAX_SCALE = 2;

    /**
     * @property x
     * @type Number
     * @public
     */
    @tracked x = 0;

    /**
     * @property y
     * @type Number
     * @public
     */
    @tracked y = 0;

    /**
     * @property scale
     * @type Number
     * @public
     */
    @tracked scale = 1;

    /**
     * The CSS transform of the canvas layer
     *
     * @property transform
     * @type String
     * @public
     */
    get transform() {
        return `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    }

    /**
     * Moves the canvas by a screen distance
     *
     * @method panBy
     * @param {Number} dx
     * @param {Number} dy
     * @public
     */
    panBy(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /**
     * Zooms by a factor, keeping the screen point (cx, cy) over the same canvas point
     *
     * @method zoomBy
     * @param {Number} factor
     * @param {Number} cx
     * @param {Number} cy
     * @public
     */
    zoomBy(factor, cx = 0, cy = 0) {
        let scale = Math.min(Viewport.MAX_SCALE, Math.max(Viewport.MIN_SCALE, this.scale * factor));
        let ratio = scale / this.scale;
        this.x = cx - (cx - this.x) * ratio;
        this.y = cy - (cy - this.y) * ratio;
        this.scale = scale;
    }

    /**
     * Zooms and pans so the box fits a screen area of this size, never zooming in past 1
     *
     * @method fit
     * @param {Object} box minX, minY, maxX and maxY in canvas units, or null
     * @param {Number} width
     * @param {Number} height
     * @param {Number} padding
     * @public
     */
    fit(box, width, height, padding = 40) {
        if (!box || width <= 0 || height <= 0) {
            this.x = 0;
            this.y = 0;
            this.scale = 1;
            return;
        }
        let boxWidth = Math.max(box.maxX - box.minX, 1);
        let boxHeight = Math.max(box.maxY - box.minY, 1);
        let scale = Math.min(1, (width - 2 * padding) / boxWidth, (height - 2 * padding) / boxHeight);
        scale = Math.min(Viewport.MAX_SCALE, Math.max(Viewport.MIN_SCALE, scale));
        this.scale = scale;
        this.x = (width - boxWidth * scale) / 2 - box.minX * scale;
        this.y = (height - boxHeight * scale) / 2 - box.minY * scale;
    }

    /**
     * The canvas point under a screen point
     *
     * @method toCanvas
     * @param {Number} sx
     * @param {Number} sy
     * @return {Object} x and y
     * @public
     */
    toCanvas(sx, sy) {
        return { x: (sx - this.x) / this.scale, y: (sy - this.y) / this.scale };
    }
}
