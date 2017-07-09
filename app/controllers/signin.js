/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Ember from "ember";

/**
 * This the signin controller.
 *
 * @class Signin
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
     * @for Signin
     * @public
     */
    session: Ember.inject.service('session'),

    /**
     * The events that this controller is listing to
     *
     * @property actions
     * @type Object
     * @for Signin
     * @public
     */
    actions: {

        /**
         * This function invalidates the session which effectively logs the user out
         * of the application
         *
         * @method authenticate
         * @public
         */
        authenticate() {
            let { username, password } = this.getProperties('username', 'password');
            this.get('session').authenticate('authenticator:oauth2', username, password).catch((reason) => {
                this.set('errorMessage', reason.error || reason);
            });
        }

    }

});