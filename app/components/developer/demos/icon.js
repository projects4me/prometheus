/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { SIZES } from 'prometheus/components/app-ui/icon';

/**
 * The AppUi::Icon demo of the Component Library: a set of icons with controls for the size, fixed width and spin,
 * plus every size, a spinning, a labelled and a prefixed icon with passed classes.
 *
 * @class DeveloperDemosIconComponent
 * @namespace Prometheus.Components.Developer.Demos
 * @extends Glimmer.Component
 */
export default class DeveloperDemosIconComponent extends Component {
  names = [
    'users',
    'user',
    'cog',
    'bell',
    'search',
    'plus',
    'pencil',
    'trash',
    'check',
    'times',
    'calendar',
    'paperclip',
  ];

  sizes = SIZES;

  @tracked size = null;
  @tracked fixedWidth = false;
  @tracked spin = false;

  /**
   * @method setSize
   * @param {String|null} size
   */
  @action
  setSize(size) {
    this.size = size;
  }

  /**
   * @method toggle
   * @param {String} property The tracked flag to flip
   */
  @action
  toggle(property) {
    this[property] = !this[property];
  }

  /**
   * @method reset
   */
  @action
  reset() {
    this.size = null;
    this.fixedWidth = false;
    this.spin = false;
  }
}
