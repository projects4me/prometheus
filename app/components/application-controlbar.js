/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This component is used to render the application header
 *
 * @class ApplicationControlbar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ApplicationControlbar
     * @type String
     * @private
     */
    tagName: 'aside',

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ApplicationControlbar
     * @type Array
     * @private
     */
    classNames: ["control-sidebar control-sidebar-dark"],

    /**
     * This function enables the control sidebar
     *
     * @method didInsertElement
     * @for ApplicationControlbar
     * @protected
     */
    didInsertElement(){
        Ember.$.AdminLTE.controlSidebar.activate();
    }

});
