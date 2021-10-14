/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/**
 * The reset scroll position is used to scroll to the top of the page.
 *
 * @class ResetScrollPosition
 * @namespace Prometheus.Utils
 * @module Ui
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class ResetScrollPosition {

    /**
     * This function is used to scroll to the top of the page.
     *
     * @method resetPosition
     * @public
     */
    resetPosition() {
        window.scrollTo(0,0);
    }
}