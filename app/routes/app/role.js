/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from "prometheus/routes/app";
import { allSettled, hashSettled } from 'rsvp';
import extractHashSettled from 'prometheus/utils/rsvp/extract-hash-settled';

/**
 * Flatten a permission query result into plain coverage entries keyed to the
 * role that was requested. Defaults from the API have empty roleId, so we must
 * stamp the requested roleId ourselves.
 *
 * @param {string} roleId
 * @param {*} recordArray Ember Data RecordArray, array, or null
 * @returns {Array<{roleId: string, resourceName: string, allowed: string}>}
 */
function toCoverageEntries(roleId, recordArray) {
    if (!recordArray) {
        return [];
    }

    let list = typeof recordArray.toArray === 'function'
        ? recordArray.toArray()
        : Array.from(recordArray);

    return list.map((permission) => ({
        roleId: String(roleId),
        resourceName: permission.resourceName || '',
        allowed: permission.allowed
    }));
}

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
     * Load roles, permissions (per role for coverage), and all userroles with
     * users (for member avatars on cards).
     *
     * @method model
     * @returns Promise
     * @protected
     */
    model() {
        let _self = this;
        let rolesOptions = {
            sort: 'Role.name',
            order: 'ASC',
            limit: -1
        };

        return hashSettled({
            roles: this.store.query('role', rolesOptions),
            userroles: this.store.query('userrole', {
                rels: 'user',
                limit: -1
            })
        }).then((results) => {
            let model = extractHashSettled(results, 'roles');
            let roleList = model.roles && typeof model.roles.toArray === 'function'
                ? model.roles.toArray()
                : (model.roles || []);

            return allSettled(
                roleList.map((role) =>
                    _self.store.query('permission', { roleId: role.id })
                )
            ).then((settled) => {
                let allPermissions = [];

                settled.forEach((result, index) => {
                    if (result.state === 'fulfilled') {
                        allPermissions = allPermissions.concat(
                            toCoverageEntries(roleList[index].id, result.value)
                        );
                    }
                });

                let userroles = model.userroles && typeof model.userroles.toArray === 'function'
                    ? model.userroles.toArray()
                    : (model.userroles || []);

                return {
                    roles: roleList,
                    permissions: allPermissions,
                    userroles
                };
            });
        }).catch((error) => {
            _self.errorManager.handleError(error, {
                moduleName: "role"
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
        let newRole = this.store.createRecord('role', {});

        if (!model) {
            controller.set('roles', []);
            controller.set('allPermissions', []);
            controller.set('allUserroles', []);
            controller.set('newRole', newRole);
            return;
        }

        controller.set('roles', model.roles || []);
        controller.set('allPermissions', model.permissions || []);
        controller.set('allUserroles', model.userroles || []);
        controller.set('newRole', newRole);
    }
}
