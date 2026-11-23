/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * Decide where a dropdown menu opens relative to its anchor: aligned to the anchor's left edge when the menu fits
 * to the right, otherwise to its right edge (growing left), and below the anchor when it fits, otherwise above.
 * A direction is only flipped when the flipped side has more room, so a menu that fits nowhere stays where it is.
 *
 * @method menuPlacement
 * @namespace Prometheus.Utils.Ui
 * @param {Object} anchor The anchor's `{left, right, top, bottom}` rectangle
 * @param {Object} menu The menu's `{width, height}`
 * @param {Object} viewport The `{width, height}` of the window
 * @param {Number} [margin=8] The gap to keep to the window's edge
 * @return {Object} `{ end, up }`, whether to align to the right edge and to open above
 */
export function menuPlacement(anchor, menu, viewport, margin = 8) {
  let roomRight = viewport.width - margin - anchor.left;
  let roomLeft = anchor.right - margin;
  let roomBelow = viewport.height - margin - anchor.bottom;
  let roomAbove = anchor.top - margin;

  return {
    end: menu.width > roomRight && roomLeft > roomRight,
    up: menu.height > roomBelow && roomAbove > roomBelow,
  };
}
