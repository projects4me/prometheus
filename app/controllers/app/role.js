/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';

/**
 * The role list controller.
 *
 * @class AppRoleController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRoleController extends PrometheusCreateController {
    /**
     * This function is called on the initialization of the controller. In this function
     * we're calling setupSchema method in order to generate schema, by analyzing metadata
     * defined in the controller, that will be used to validate the form of the template.
     *
     * @method constructor
     * @public
     */
    constructor() {
        super(...arguments);
        this.setupSchema();
    }

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
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppRoleController
     * @protected
     */
    metadata = {
        sections: [
            {
                name: "roleCreate",
                fields: [
                    {
                        name: "name",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    },
                    {
                        name: "description",
                        validations: {
                            default: {
                                type: "string",
                                rules: [
                                    {
                                        name: "required"
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    }

    /**
     * This function return list of roles against the query given by the user.
     * 
     * @property filteredRoles
     * @return Array
     */
    get filteredRoles() {
        return this.roles.filter((role) => {
            return role.name.toLowerCase().includes(this.searchQuery)
                || role.name.includes(this.searchQuery);
        });
    }

    /**
     * This function checks whether the current route is of role.page or not and then
     * return boolean value.
     * 
     * @property isRolePage
     * @return Boolean
     */
    get isRolePage() {
        return this.router.currentRoute.localName === 'page';
    }

    /**
     * This function returns the css classes for the div containing roles, depending upon
     * the current route.
     * 
     * @property roleClass
     * @return String
     */
    get rolesClass() {
        return this.isRolePage
            ? 'col-lg-2 col-md-12'
            : 'col-md-12';
    }

    /**
     * This function returns the css classes for the role cards, depending upon
     * the current route.
     * 
     * @property roleCardClass
     * @return String
     */
    get roleCardClass() {
        return this.isRolePage
            ? 'col-lg-12 col-md-3 col-sm-6 col-xs-6'
            : 'col-xs-6 col-sm-6 col-lg-2 col-md-3';
    }
}