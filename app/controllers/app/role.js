/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action, computed } from '@ember/object';

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
     * This flag is used to show or hide the modal dialog box for adding new roles
     * in the system.
     *
     * @property addRoleDialog
     * @type bool
     * @for AppRoleController
     * @private
     */
    addRoleDialog = false;

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
    @computed('roles.length', 'searchQuery')
    get filteredRoles() {
        return this.roles.filter((role) => {
            return role.name.toLowerCase().includes(this.searchQuery)
                || role.name.includes(this.searchQuery);
        });
    }

    /**
     * Whether the role detail pane (or its loading/error state) is active.
     * Must be true while page is loading so the cards column stays narrow
     * and the skeleton renders beside it, not below the full-width grid.
     *
     * @property isRolePage
     * @return Boolean
     */
    get isRolePage() {
        let routeName = this.router.currentRouteName || '';
        return routeName.includes('role.page');
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
            ? 'col-lg-2 col-md-12 col-sm-12 col-xs-12'
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

    /**
     * This function is used to show the add role modal dialog box by setting
     * the addRoleDialog flag to true.
     *
     * @method showAddRoleDialog
     * @protected
     */
    @action showAddRoleDialog() {
        this.set('addRoleDialog', true);
    }

    /**
     * This function is used to hide the add role modal
     *
     * @method removeModal
     * @protected
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.set('addRoleDialog', false);
        $('.modal').modal('hide');
    }

    /**
     * This function is used to add a new role in the system
     *
     * @method addRole
     * @protected
     */
    @action addRole() {
        Logger.debug('AppRoleController:addRole');
        let _self = this;
        let newRole = _self.newRole;

        this.validate(newRole, 'roleCreate')
            .then((validation) => {
                if (validation.isValid) {
                    newRole.save().then(function (role) {
                        Logger.debug('A new role has been saved');
                        _self.roles.pushObject(role);

                        new Messenger().post({
                            message: _self.intl.t("views.app.role.created", { name: role.name }),
                            type: 'success',
                            showCloseButton: true
                        });

                        _self.removeModal();
                        _self.set('newRole', _self.store.createRecord('role', {}));
                    });

                } else {
                    let messages = _self._buildMessages(validation.errors, 'role');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
            });
        return false;
    }
}