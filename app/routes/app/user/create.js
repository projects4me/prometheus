/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * This is the route that will handle the creation of new users.
 *
 * @class AppUserCreateRoute
 * @namespace Prometheus.Routes
 * @module App
 * @extends App
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserCreateRoute extends App {

    /**
     * The model hook. In this hook we're creating a new user model and return that model for use 
     * in user creation form.
     * 
     * @method model
     * @public
     */
    model() {
        let user = this.store.createRecord('user');
        return user;
    }

    /**
     * The setupController hook.
     * 
     * @param {AppUserCreateController} controller 
     * @param {Prometheus.Models.User} model 
     */
    setupController(controller, model) {
        controller.set('model', model);
    }
}
