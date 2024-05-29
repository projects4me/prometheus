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

        let membershipOptions = {
            query: `((roleId : ${params.role_id}))`,
            rels: 'project,user',
            limit: -1
        }

        return hashSettled({
            role: this.store.findRecord('role', params.role_id),
            permissions: this.store.query('permission', permissionOptions),
            memberships: this.store.query('membership', membershipOptions)
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
        let newMembership = this.store.createRecord('membership', {
            roleId: model.role.id,
            relatedTo: "system",
        });

        controller.set('model', model.role);
        controller.set('model.permissions', model.permissions);
        controller.set('memberships', model.memberships.toArray());
        controller.set('newMembership', newMembership);
    }
}
