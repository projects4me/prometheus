/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@ember/component';
import { inject } from '@ember/service';
import $ from 'jquery';

/**
 * Application control sidebar (AdminLTE).
 *
 * @class ApplicationControlbar
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default Component.extend({

    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for ApplicationControlbar
     */
    currentUser: inject('current-user'),

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
        $.AdminLTE.controlSidebar.activate();
        this._super(...arguments);
        this.users = [];
    }
});
