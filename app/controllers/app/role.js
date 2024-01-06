/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

/**
 * The role list controller.
 *
 * @class AppRoleController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRoleController extends Controller {
    /**
     * This property is used to keep track the query for searching the role.
     *
     * @property searchQuery
     * @type String
     * @for AppRoleController
     * @private
     */
    @tracked searchQuery = '';

    /**
     * This function return list of roles against the query given by the user.
     * 
     * @method get
     * @return Array
     */
    get filteredRoles() {
        return this.roles.filter((role) => {
            return role.name.toLowerCase().includes(this.searchQuery)
                || role.name.includes(this.searchQuery);
        });
    }
}
