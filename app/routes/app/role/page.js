/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';

/**
 *  This is the route to load a role selected by the user.
 *
 *  @class AppRolePageRoute
 *  @namespace Prometheus.Routes
 *  @module App.Role
 *  @extends AppRoute
 *  @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRolePageRoute extends AppRoute {
    /**
     * The model hook for this route. This function returns a role.
     *
     * @method model;
     * @public
     */
    model(params) {
        return this.store.findRecord('role', params.role_id);
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
        controller.set('model', model);
    }
}
