/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

/**
 * Generic search field component with conversation-style UI.
 *
 * @class FieldSearch
 * @namespace Prometheus.Components
 * @extends Component
 */
export default class FormFieldsFieldSearchComponent extends Component {

  /**
   * Handle input event and forward value to optional handlers.
   *
   * @method handleInput
   * @param {Event} event
   */
  @action
  handleInput(event) {
    let value = event.target.value;
    debounce(this, this._debouncedInput, value, event, 200);
  }

  /**
   * Internal debounced input handler.
   *
   * @method _debouncedInput
   * @param {String} value
   * @param {Event} event
   * @private
   */
  _debouncedInput(value, event) {
    if (typeof this.args.onInput === 'function') {
      this.args.onInput(value, event);
    } else if (typeof this.args.searchFunction === 'function') {
      this.args.searchFunction(value);
    }
  }
}