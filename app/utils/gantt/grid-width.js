/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The width rules of the Gantt issue grid, in px: the limits, the default and which columns fit.
 *
 * @module gantt/grid-width
 */

export const GRID_MIN_WIDTH = 240;
export const GRID_DEFAULT_WIDTH = 420;
export const GRID_STEP = 16;

/**
 * The room the name cell always keeps (conflict icon, #number, ellipsis title and the open button), then the width
 * of each optional column in the order they drop: Planned start, Est, End, Start, Who (the last in the list drops last).
 */
const NAME_WIDTH = 180;
const COLUMN_WIDTHS = [44, 64, 64, 44, 96];

/**
 * The widest the grid may be: half of the Gantt container (never below the minimum); no container yet means no limit but the minimum
 *
 * @function maxGridWidth
 * @param {Number} containerWidth
 * @return {Number}
 */
export function maxGridWidth(containerWidth) {
	return containerWidth > 0 ? Math.max(GRID_MIN_WIDTH, Math.floor(containerWidth / 2)) : GRID_DEFAULT_WIDTH;
}

/**
 * Clamps a width into the minimum and the container's maximum; a non-number gives the default
 *
 * @function clampGridWidth
 * @param {Number} width
 * @param {Number} containerWidth
 * @return {Number}
 */
export function clampGridWidth(width, containerWidth) {
	let value = typeof width === 'number' && Number.isFinite(width) ? width : GRID_DEFAULT_WIDTH;
	return Math.round(Math.min(maxGridWidth(containerWidth), Math.max(GRID_MIN_WIDTH, value)));
}

/**
 * How many optional columns fit a grid width: 5 shows Who, Start, End, Est and Planned start; 0 shows only the name.
 * Planned start drops first, then Est, End, Start and Who.
 *
 * @function visibleColumns
 * @param {Number} width
 * @return {Number}
 */
export function visibleColumns(width) {
	let room = width - NAME_WIDTH;
	let count = 0;
	for (let columnWidth of COLUMN_WIDTHS) {
		if (room < columnWidth) {
			break;
		}
		room -= columnWidth;
		count++;
	}
	return count;
}
