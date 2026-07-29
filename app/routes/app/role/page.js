/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoute from 'prometheus/routes/app';
import { hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';

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
        let _self = this;
        let permissionOptions = {
            roleId: params.role_id
        }

        let userroleOptions = {
            query: `((roleId : ${params.role_id}))`,
            rels: 'user',
            limit: -1
        }

        return hashSettled({
            role: this.store.findRecord('role', params.role_id),
            permissions: this.store.query('permission', permissionOptions),
            userroles: this.store.query('userrole', userroleOptions)
        }).then((results) => {
            return extractHashSettled(results, 'role');
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: 'role'
            });
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
        let newUserrole = this.store.createRecord('userrole', {
            roleId: model.role.id,
        });

        controller.set('model', model.role);
        controller.set('model.permissions', model.permissions);
        controller.set('userroles', model.userroles.toArray());
        controller.set('newUserrole', newUserrole);
        this.breadcrumb.setTitle(this.routeName, model.role.get('name'));
    }
}
