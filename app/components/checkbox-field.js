/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * A checkbox that reports its checked state to @onChange when the user toggles it. Attributes such as
 * data-select are passed through to the input.
 *
 * @example
 *  <CheckboxField @onChange={{this.select}} data-select={{entity.id}} />
 *
 * @class CheckboxField
 * @namespace Prometheus.Components
 * @extends Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class CheckboxFieldComponent extends Component {

    /**
     * Forwards the new checked state to @onChange.
     *
     * @method change
     * @param {Event} event
     * @public
     */
    @action
    change(event) {
        if (typeof this.args.onChange === 'function') {
            this.args.onChange(event.target.checked);
        }
    }
}
