/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import { hash } from 'rsvp';

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
        let permissionOptions = {
            roleId: params.role_id
        }
        return hash({
            role: this.store.findRecord('role', params.role_id),
            permissions: this.store.query('permission', permissionOptions)
        });
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
        controller.set('model', model.role);
        controller.model.permissions = model.permissions;
    }
}
