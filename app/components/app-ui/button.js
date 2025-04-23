/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
/**
 * This component is used to render the button element.
 *
 * @class AppUiButtonComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUiButtonComponent extends Component {
    /**
     * This property is used to track the disabled state of the button.
     *
     * @property disabled
     * @type Boolean
     * @for AppUiButtonComponent
     */
    @tracked disabled = false;

    /**
     * This function is triggered when user clicks on the button. It calls the action passed to
     * onClick argument. It also disables the button when the action is in progress and enables it
     * when the action is completed. If user don't want to enable the button after the action is
     * completed, they can set disableOnSuccess to true.
     *
     * @method handleClick
     * @for AppUiButtonComponent
     * @public
     */
    @action async handleClick() {
        let { onClick, disableOnSuccess } = this.args;
        this.disabled = true;
        try {
            await onClick();
            !disableOnSuccess && (this.disabled = false);
        } catch (e) {
            this.disabled = false;
        }
    }
}
