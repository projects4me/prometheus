/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This class is used to provide the application contents
 * a wrapper
 *
 * @class ApplicationWrapper
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * This function is used to activate the AdminLTE layout
     *
     * @method didInsertElement
     * @for ApplicationWrapper
     * @public
     */
    didInsertElement(){
        Ember.$.AdminLTE.layout.activate();
        Ember.$.AdminLTE.boxWidget.activate();
    }
});
