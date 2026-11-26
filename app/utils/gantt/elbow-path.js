/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { GANTT_ROW_HEIGHT } from 'prometheus/utils/gantt-helpers';

/**
 * Length in px of the horizontal stub that leaves the first bar and enters the dependent bar
 *
 * @property STUB
 * @type Number
 * @final
 */
export const STUB = 20;

/**
 * px the line starts after the source bar's right edge, so it visibly leaves the bar
 *
 * @property START_GAP
 * @type Number
 * @final
 */
export const START_GAP = 2;

/**
 * px the arrowhead stops short of the target bar's left edge, so it does not touch the bar
 *
 * @property END_GAP
 * @type Number
 * @final
 */
export const END_GAP = 4;

/**
 * Row height used when the caller does not pass one
 *
 * @property DEFAULT_ROW_HEIGHT
 * @type Number
 * @final
 */
const DEFAULT_ROW_HEIGHT = GANTT_ROW_HEIGHT;

/**
 * Build the SVG path of a right-angled (elbow) dependency connector.
 *
 * Forward links (the gap between the start and end points, after START_GAP and END_GAP, is at least 2 * STUB) go start -> right stub -> vertical -> end.
 * Backward or tight links leave through the stub, drop to the boundary between the
 * first issue's row and the next row towards the target, run back and enter from the left.
 * Siblings of one issue share the start.x + START_GAP + STUB trunk.
 *
 * @method buildElbowPath
 * @param {{x:Number,y:Number}} start right edge of the first bar, mid-height
 * @param {{x:Number,y:Number}} end left edge of the dependent bar, mid-height
 * @param {Number} rowHeight height of one Gantt row in px
 * @param {Number} offset px the vertical run is shifted by, so a second link between the same pair stays visible
 * @returns {String}
 */
export function buildElbowPath(start, end, rowHeight = DEFAULT_ROW_HEIGHT, offset = 0) {
    if (!start || !end) {
        return '';
    }

    const startX = start.x + START_GAP;
    const endX = end.x - END_GAP;
    const trunkX = startX + STUB + offset;

    if (endX - startX >= 2 * STUB) {
        return `M ${startX} ${start.y} H ${trunkX} V ${end.y} H ${endX}`;
    }

    // Towards the target's row; same row (or target above) handled: only strictly above goes up.
    const gapY = end.y < start.y ? start.y - rowHeight / 2 + offset : start.y + rowHeight / 2 + offset;

    return `M ${startX} ${start.y} H ${trunkX} V ${gapY} H ${endX - STUB - offset} V ${end.y} H ${endX}`;
}
