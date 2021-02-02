/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { inject } from '@ember/service';
import Controller from '@ember/controller';

/**
 * This the signin controller.
 *
 * @class Signin
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Hammad Hassan gollmer@gmail.com
 */
export default Controller.extend({

    /**
     * The session service which is offered by ember-simple-auth that will be used
     * in order to verfy whether the used is authenticated
     *
     * @property session
     * @type Object
     * @for Signin
     * @public
     */
    session: inject(),

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
         * of the application and if user is authenticated then we'll route user to
         * "app" route
         *
         * @method authenticate
         * @public
         */
        async authenticate() {
            let { username, password } = this.getProperties('username', 'password');
            let _self = this;
            
            await this.session.authenticate('authenticator:oauth2', username, password).then(() => {
                if(_self.session.isAuthenticated) {
                    _self.session.handleAuthentication('app');
                }
            });
        }
 
    }

});