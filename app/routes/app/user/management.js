/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 * This is the route to load the list of users.
 *
 * @class AppUserManagementRoute
 * @namespace Prometheus.Routes
 * @module App.User
 * @extends AppRoute
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppUserManagementRoute extends App {

    /**
     * The model hook for this route. In this function we fetch and return the list 
     * of users.
     *
     * @method model;
     * @public
     */
    model() {
        Logger.debug('+Prometheus.Routes.App.User.Management::model()');

        let _userOptions = {
            limit: -1,
            fields: "name,title,email,accountStatus"
        };

        Logger.debug('-Prometheus.Routes.App.User.Management::model()');
        return this.store.query('user', _userOptions);
    }

    /**
     * This function is used to setup the controller for this route.
     *
     * @method setupController
     * @param {Prometheus.Controllers.Board} controller the controller object for this route
     * @param Object model
     * @public
     */
    setupController(controller, model) {
        Logger.debug('+Prometheus.Routes.App.User.Management::setupController()');

        controller.set('users', model);
    }

}
