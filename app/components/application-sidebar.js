/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from 'ember';

/**
 * This component is used to render the application header
 *
 * @class ApplicationSidebar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Ember.Component.extend({

    /**
     * The tag to be used for this component
     *
     * @property tagName
     * @for ApplicationSidebar
     * @type String
     * @private
     */
    tagName: 'aside',

    /**
     * The classes to be rendered with the element
     *
     * @property classNames
     * @for ApplicationSidebar
     * @type Array
     * @private
     */
    classNames: ["main-sidebar"],

});
