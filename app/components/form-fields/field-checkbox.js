/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

/**
 * This component renders checkbox.
 *
 * @class FieldCheckbox
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class FieldCheckboxComponent extends Component {
  /**
   * Id tying the label to the input.
   *
   * @property inputId
   * @type String
   */
  /**
   * The @select callback, or a no-op when none is given.
   *
   * @property onSelect
   * @type Function
   */
  get onSelect() {
    return this.args.select ?? (() => {});
  }

  inputId = `${guidFor(this)}-checkbox`;
}
