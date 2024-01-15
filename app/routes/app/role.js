/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";

/**
 *  This is the route to load the list of roles.
 *
 *  @class AppRoleRoute
 *  @namespace Prometheus.Routes
 *  @module App.Role
 *  @extends App
 *  @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRoleRoute extends App {
    /**
     * The model hook for this route. In this function we fetch and return the list of roles.
     *
     * @method model;
     * @returns Promise
     * @protected
     */
    model() {
        let rolesOptions = {
            sort: 'Role.name',
            order: 'ASC',
            limit: -1
        };

        return this.store.query('role', rolesOptions);
    }

    /**
     * This function is used to setup the controller for this route.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Role} controller the controller object for this route
     * @param Object model
     * @public
     */
    setupController(controller, model) {
        let newRole = this.store.createRecord('role', {});

        controller.set('roles', model.toArray());
        controller.set('newRole', newRole);
    }
}
