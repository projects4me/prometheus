/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This the app controller. App is as the main route for the application's
 * authenticated part
 *
 * @class App
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Ember.Controller.extend({

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verfy whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for App
     * @public
     */
    session: Ember.inject.service('session'),

    /**
     * The service that we use to maintain the currentUser
     *
     * @property currentUser
     * @type Object
     * @for App
     * @public
     */
    currentUser: Ember.inject.service('current-user'),

    /**
     * The related field service that is used in order to manage dropdowns and relate fields
     *
     * @property relatedField
     * @type relatedFieldService
     * @for App
     * @public
     */
    relatedFields: Ember.inject.service('related-fields'),

    /**
     * The events that this controller is listing to
     *
     * @property actions
     * @type Object
     * @for App
     * @public
     */
    actions: {

        /**
         * This function invalidates the session which effectively logs the user out
         * of the application
         *
         * @method invalidateSession
         * @public
         */
        invalidateSession() {
            this.get('session').invalidate();
        }

    }

});