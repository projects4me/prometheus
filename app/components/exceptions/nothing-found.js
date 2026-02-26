/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * This component is used to an exception, if there is no content to display.
 *
 * @class ExceptionsNothingFoundComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class ExceptionsNothingFoundComponent extends Component {
    /**
     * Whether the info icon is required.
     * @property infoIconRequired
     * @type {boolean}
     * @public
     */
    get infoIconRequired() {
        return this.args.infoIcon === true || this.args.infoIcon === undefined;
    }

    /**
     * Updates the font style of the element.
     * @method updateFontStyle
     * @param {Element} element - The element to update the font style of.
     * @public
     */
    @action
    updateFontStyle(element) {
        if (this.args.fontStyle) {
            element.style.fontStyle = this.args.fontStyle;
        }
    }
}
