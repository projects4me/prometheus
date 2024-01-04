/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Modifier from 'ember-modifier';
import $ from 'jquery';

/**
 * This modifier is called on the initialization of div that has overflow on y-axis, to attach
 * slimscroll to that element.
 *
 * @example
 *      <div {{initialize-slimscroll model=this.model.length}}>
 * 
 * @class InitializeSlimscrollModifier
 * @namespace Prometheus.Modifiers
 * @extends Modifier
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class InitializeSlimscrollModifier extends Modifier {

    /**
     * This function returns model length. The use of this property here is just to 
     * trigger the didUpdateArguments function in order to attach slimscroll to that element again,
     * on update of the model.
     *
     * @method get
     * @return String
     * @public
     */
    get model() {
        return this.args.named.model;
    }

    /** Called when the modifier is installed on the DOM element*/
    didInstall() {
        this._attachSlimScroll();
    }

    /**Called when the arguments provided to modifier are updated*/
    didUpdateArguments() {
        this._attachSlimScroll();
    }

    /**
     * This function returns the value that will be used to set the width of the scroll bar.
     * 
     * @method get
     * @retrun String
     * @public
     */
    get width() {
        return this.args.named.width;
    }

    /**
     * This function apply slim scroll to element.
     * 
     * @method _attachSlimScroll
     * @private
     */
    _attachSlimScroll() {
        let defaulWidth = 3, size;
        size = this.width ?? defaulWidth;

        $(this.element).slimScroll({
            height: this.element.clientHeight,
            allowVisible: false,
            size: size
        });
    }
}
