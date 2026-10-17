/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusCreateController from 'prometheus/controllers/prometheus/create';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import { inject as controller } from '@ember/controller';
import { htmlSafe } from '@ember/template';

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
     * The role list controller. Delete is triggered from app.role.page, which
     * extends this class but does not own the roles array — the parent route does.
     *
     * @property roleListController
     * @type Prometheus.Controller.App.Role
     * @for AppRoleController
     * @private
     */
    @controller('app.role') roleListController;

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
     * Roles shown on the list. Reassign the array (do not mutate in place) so
     * autotracking invalidates dependent getters.
     *
     * @property roles
     * @type {Array}
     */
    @tracked roles = [];

    /**
     * Plain coverage entries `{ roleId, resourceName, allowed }` for all roles.
     *
     * @property allPermissions
     * @type {Array}
     */
    @tracked allPermissions = [];

    /**
     * Userrole records (with user) used to build member avatars on cards.
     *
     * @property allUserroles
     * @type {Array}
     */
    @tracked allUserroles = [];

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
     * Roles matching the current search query.
     *
     * @property filteredRoles
     * @return {Array}
     */
    get filteredRoles() {
        let query = (this.searchQuery || '').toLowerCase();
        let roles = this.roles || [];

        if (!query) {
            return roles;
        }

        return roles.filter((role) => {
            let name = (role.name || '').toLowerCase();
            return name.includes(query);
        });
    }

    /**
     * Action-level permission resource names (e.g. "issue.get", "role.delete") are
     * those whose second dot-segment is one of the four CRUD verbs. Field-mode
     * permissions ("issue.subject", "issue.name") are excluded so the denominator
     * reflects meaningful privilege surface rather than schema width.
     */
    _ACTION_VERBS = new Set(['get', 'create', 'update', 'delete']);

    /**
     * Whether an action permission counts as granted for coverage.
     *
     * Matches product ACL semantics: unset / empty allowed is the permissive
     * default (grant). Explicit denies are '0'. Explicit grants are '1' (all)
     * or '2' (members, for scoped resources).
     *
     * @method isActionAllowed
     * @param {*} allowed
     * @returns {boolean}
     */
    isActionAllowed(allowed) {
        if (allowed === '0' || allowed === 0) {
            return false;
        }
        // Permissive default (not yet saved / empty string)
        if (allowed === '' || allowed === null || allowed === undefined) {
            return true;
        }
        return allowed === '1'
            || allowed === 1
            || allowed === '2'
            || allowed === 2
            || allowed === true;
    }

    /**
     * Permission-coverage percentage for every role.
     * Reads `@tracked` `allPermissions` / `roles` so autotracking invalidates
     * this getter when those arrays are reassigned.
     *
     * @property coverageByRole
     * @type {Object}
     */
    get coverageByRole() {
        let statsByRole = {};
        let actionVerbs = this._ACTION_VERBS;

        (this.allPermissions || []).forEach((permission) => {
            let parts = (permission.resourceName || '').split('.');
            if (parts.length !== 2 || !actionVerbs.has(parts[1])) {
                return;
            }

            let roleId = String(permission.roleId);
            if (!statsByRole[roleId]) {
                statsByRole[roleId] = { total: 0, allowed: 0 };
            }
            statsByRole[roleId].total++;
            if (this.isActionAllowed(permission.allowed)) {
                statsByRole[roleId].allowed++;
            }
        });

        let coverage = {};
        (this.roles || []).forEach((role) => {
            let stats = statsByRole[String(role.id)];
            coverage[role.id] = (stats && stats.total)
                ? Math.round((stats.allowed / stats.total) * 100)
                : 0;
        });

        return coverage;
    }

    /**
     * Users assigned to each role, keyed by roleId.
     *
     * @property membersByRole
     * @type {Object}
     */
    get membersByRole() {
        let byRole = {};

        (this.allUserroles || []).forEach((userrole) => {
            let roleId = String(get(userrole, 'roleId') || '');
            if (!roleId) {
                return;
            }

            // belongsTo may be a PromiseProxy — always use Ember.get, never `.id`
            let user = get(userrole, 'user');
            let userId = user ? get(user, 'id') : null;
            if (!userId) {
                return;
            }

            if (!byRole[roleId]) {
                byRole[roleId] = [];
            }

            // Plain objects so avatar templates never hit proxy `.id` asserts
            byRole[roleId].push({
                id: userId,
                name: get(user, 'name') || ''
            });
        });

        return byRole;
    }

    /**
     * Replace coverage entries for one role and reassign `allPermissions` so
     * `coverageByRole` autotracks.
     *
     * @method syncRoleCoverage
     * @param {string} roleId
     * @param {Array} permissions Ember Data permission records or plain entries
     */
    syncRoleCoverage(roleId, permissions) {
        let roleIdStr = String(roleId);
        let retained = (this.allPermissions || []).filter(
            (entry) => String(entry.roleId) !== roleIdStr
        );

        let list = [];
        if (permissions) {
            list = typeof permissions.toArray === 'function'
                ? permissions.toArray()
                : Array.from(permissions);
        }

        let fresh = list.map((permission) => ({
            roleId: roleIdStr,
            resourceName: get(permission, 'resourceName') || '',
            allowed: get(permission, 'allowed')
        })).filter((entry) => entry.resourceName);

        this.allPermissions = [...retained, ...fresh];
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
                        // Reassign tracked arrays (in-place pushObject would not invalidate getters)
                        _self.roles = [...(_self.roles || []), role];

                        // Load this role's permission catalog so coverage % is correct
                        // immediately (permission list API requires roleId).
                        _self.store.query('permission', { roleId: role.id }).then((perms) => {
                            let entries = (typeof perms.toArray === 'function'
                                ? perms.toArray()
                                : Array.from(perms || [])
                            ).map((permission) => ({
                                roleId: String(role.id),
                                resourceName: permission.resourceName || '',
                                allowed: permission.allowed
                            }));
                            _self.allPermissions = [
                                ...(_self.allPermissions || []),
                                ...entries
                            ];
                        }).catch(() => {
                            // Coverage stays 0 until next full list reload — non-fatal.
                        });

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

    /**
     * Delete a role after Messenger confirmation. Used from the role
     * detail page (page controller extends this controller).
     *
     * @method deleteRole
     * @param {Prometheus.Models.Role} role
     * @protected
     */
    @action deleteRole(role) {
        Logger.debug('App.Role->deleteRole');
        let _self = this;
        let moduleTranslated = _self.intl.t('global.module.singular.role');

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t('views.app.module.list.delete.message', {
                moduleName: moduleTranslated,
                name: role.name
            })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t('views.app.module.list.delete.confirmDelete', {
                        moduleName: moduleTranslated
                    })).toString(),
                    action: function () {
                        deleting.update({
                            message: _self.intl.t('views.app.module.list.delete.deleting', {
                                moduleName: moduleTranslated
                            }),
                            type: 'info',
                            actions: false,
                            hideAfter: false
                        });

                        return role.destroyRecord().then(function () {
                            // Roles live on app.role (list), not on the page controller instance.
                            let listController = _self.roleListController;
                            if (listController.roles) {
                                listController.roles = listController.roles.filter(
                                    (entry) => String(entry.id) !== String(role.id)
                                );
                            }
                            if (listController.allPermissions) {
                                listController.allPermissions = listController.allPermissions.filter(
                                    (entry) => String(entry.roleId) !== String(role.id)
                                );
                            }
                            if (listController.allUserroles) {
                                listController.allUserroles = listController.allUserroles.filter(
                                    (entry) => String(get(entry, 'roleId')) !== String(role.id)
                                );
                            }

                            if (_self.isRolePage
                                && String(_self.model?.id) === String(role.id)) {
                                _self.router.transitionTo('app.role');
                            }

                            return deleting.update({
                                message: _self.intl.t('views.app.module.list.delete.deleted', {
                                    moduleName: moduleTranslated
                                }),
                                type: 'success',
                                actions: false,
                                hideAfter: 3
                            });
                        }).catch(function (error) {
                            let detail = error.detail || {};
                            let errorMessage = detail.error || error.message;
                            let suggestion = detail.suggestion;
                            let message = suggestion
                                ? `${errorMessage} | ${suggestion}`
                                : errorMessage;

                            return deleting.update({
                                message: message,
                                type: 'error',
                                actions: false,
                                showCloseButton: true
                            });
                        });
                    }
                },
                cancel: {
                    label: htmlSafe(_self.intl.t('views.app.module.list.delete.onsecondthought')).toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t('views.app.module.list.delete.deletecancel'),
                            type: 'success',
                            actions: false,
                            hideAfter: 3
                        });
                    }
                }
            }
        });

        Logger.debug('-App.Role->deleteRole');
    }
}