/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';

/**
 * The Font Awesome 4 size modifiers @size accepts.
 *
 * @property SIZES
 * @type {Array<string>}
 * @public
 */
export const SIZES = ['lg', '2x', '3x', '4x', '5x'];

const PREFIX = 'fa-';

/**
 * The bare icon name: trimmed, with a leading `fa-` removed so names built for the old markup keep working.
 *
 * @method iconName
 * @param {String} name The icon name, bare (`users`) or prefixed (`fa-users`)
 * @return {String}
 * @public
 */
export function iconName(name) {
  let value = String(name ?? '').trim();

  return value.startsWith(PREFIX) ? value.slice(PREFIX.length) : value;
}

/**
 * One icon. Every icon in the app renders through this component, so the icon set can be replaced in one place.
 * Today it renders exactly the Font Awesome 4 markup written by hand before (`<i class="fa fa-users">`), hidden from
 * assistive technology unless `@label` names it.
 *
 * @class AppUiIconComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 */
export default class AppUiIconComponent extends Component {
  /**
   * The Font Awesome classes: the icon, then fa-fw, fa-spin and the size when asked for. An unknown size is ignored.
   *
   * @property classes
   * @type String
   */
  get classes() {
    let classes = ['fa'];
    let name = iconName(this.args.name);
    if (name) {
      classes.push(`${PREFIX}${name}`);
    }
    if (this.args.fixedWidth) {
      classes.push('fa-fw');
    }
    if (this.args.spin) {
      classes.push('fa-spin');
    }
    if (SIZES.includes(this.args.size)) {
      classes.push(`${PREFIX}${this.args.size}`);
    }

    return classes.join(' ');
  }
}
