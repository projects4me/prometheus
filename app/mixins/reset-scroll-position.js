/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Mixin from '@ember/object/mixin';

/**
 * This mixin is used to scroll to the top the page when ever a route changes.
 *
 * @class ResetScrollPosition
 * @namespace Prometheus.Mixins
 * @module App.Project
 * @extends Ember.Mixin
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Mixin.create({

    /**
     * This function is triggered whenever a route changes, and not when a model changes.
     * We are using this function in order to reset the scroll position to the top of the page.
     *
     * @method activate
     * @private
     */
    activate: function() {
        this._super();
        window.scrollTo(0,0);
    }
});