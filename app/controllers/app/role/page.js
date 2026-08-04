/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoleController from 'prometheus/controllers/app/role';
import { action, computed } from '@ember/object';
import { inject as controller } from '@ember/controller';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';
import $ from 'jquery';

/**
 * The role page controller.
 *
 * @class AppRolePageController
 * @namespace Prometheus.Controller
 * @extends Ember.Controller
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AppRolePageController extends AppRoleController {
    /**
     * This array contains the permissions of the selected module from the accordion
     * e.g. Project.
     * 
     * @property modulePermissions
     * @protected
     */
    @tracked modulePermissions = [];

    /**
     * This maintains the query for searching the user associated with the current role.
     * 
     * @property userSearchQuery
     * @protected
     */
    @tracked userSearchQuery = '';

    /**
     * This object maintains all of the permissions state that are updated by the user.
     * 
     * @property permissionsState
     * @protected
     */
    @tracked permissionsState = {};

    /**
     * This flag is used to show or hide the modal dialog box for assigning
     * this role to a user via userrole.
     *
     * @property addUserroleDialog
     * @type bool
     * @for AppRolePageController
     * @private
     */
    @tracked addUserroleDialog = false;

    /**
     * The app controller.
     * 
     * @property appController
     * @type Prometheus.Controller.App
     * @for AppRolePageController
     * @private
     */
    @controller('app') appController;

    /**
     * This object holds all of the information that we need to create our schema and also need to 
     * render the template (in future).
     * @property metadata
     * @type Object
     * @for AppRolePageController
     * @protected
     */
    metadata = {
        sections: [
            {
                name: "userroleCreate",
                fields: [
                    {
                        name: "userId",
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
     * This method update the given field's value and save the role model.
     * 
     * @param {String} fieldToEdit 
     * @param {String} value 
     * @method editRole
     */
    @action editRole(fieldToEdit) {
        let _self = this;

        if (_.isEmpty(this.message?.roleCreate?.[fieldToEdit])
            && _self.hasChanged(this.model)
            && !_self.model.isSaving) {
            _self.model.save().then(() => {
                let successMessage = htmlSafe(_self.intl.t('views.app.role.list.updated', { field: fieldToEdit }));
                new Messenger().post({
                    message: successMessage,
                    type: 'success',
                    showCloseButton: true
                });
            });
        }
    }

    /**
     * Role permissions grouped by module from resourceName (e.g. issue.get → module issue).
     *
     * @property permissions
     * @protected
     */
    @computed('model.permissions')
    get permissions() {
        let rolesPermissions = {};
        let permissions = this.model.permissions || [];

        permissions.forEach((permission) => {
            if (!permission.resourceName || !permission.resourceName.includes('.')) {
                return;
            }

            let [moduleName, ...actionParts] = permission.resourceName.split('.');
            let action = actionParts.join('.');
            permission.moduleName = moduleName;
            permission.resourceAlias = action;

            if (!rolesPermissions[moduleName]) {
                rolesPermissions[moduleName] = [];
            }
            rolesPermissions[moduleName].push(permission);
        });

        return rolesPermissions;
    }

    /**
     * This action is triggered when user selects a module from the accordion, to set all of
     * the permissions related to that module.
     * 
     * @method setPermissions
     * @param {string} resourceName
     * @protected
     */
    @action setPermissions(resourceName) {
        this.modulePermissions = this.permissions[resourceName];
    }

    /**
     * This task calls updatePermissionTask task to update the given permission model.
     * 
     * @method updatePermission
     * @param {Prometheus.Models.Permission} permission
     * @param {String} moduleName
     * @param {String} flag
     * @param {String} roleId
     * @param {Event} evt
     * @protected
     */
    @(task(function* (moduleName) {
        let moduleEl = document.querySelector(`[data-permission-module="${moduleName}"]`);
        let permissions = this.getChangedPermissions(moduleName);

        if (!permissions.length) {
            return;
        }

        this.permissionsState[moduleName] = this.permissionsState[moduleName] || {};

        for (let i = 0; i < permissions.length; i++) {
            let permission = permissions.objectAt(i);

            let permissionEl = moduleEl.querySelector(`[data-module-resource="${permission.resourceName}"]`);
            if (permissionEl) {
                yield this.activateTabForPermission(permissionEl);
                permissionEl.classList.add("light-gray");
                this.scrollToPermission(permissionEl);
            }

            this.permissionsState[moduleName][permission.resourceAlias] = this.updatePermissionTask.perform(permission, moduleName, permissions.length);

            this.updatePermissionState(moduleName, permission.resourceAlias, null, null);
            yield this.permissionsState[moduleName][permission.resourceAlias];

            // If got an error while updating the permission, update its template state.
            if (this.permissionsState[moduleName][permission.resourceAlias].isErrored) {
                this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
            }

            // On success, check icon will be showed in template for 0.5 sec.
            let delay = this.getDelay(permissions.length)
            yield timeout(delay);

            // To remove success (check) icon.
            this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
            if (permissionEl) {
                permissionEl.classList.remove("light-gray");
            }

            // Destroy resource's permission state
            _.unset(this.permissionsState[moduleName], permission.resourceAlias);
        }

        yield this.scrollToLatestCancelledPermission(moduleEl, moduleName);
        this.showMessages(moduleName);
    })) updatePermission

    /**
     * This task is used to update the permission model.
     * 
     * @param {Prometheus.Model.Permission} permission
     * @param {String} moduleName
     * @param {Number} permissionsCount Count of permissions that are to be updated.
     * @method updatePermissionTask
     */
    @(task(function* (permission, moduleName, permissionsCount) {
        let delay = this.getDelay(permissionsCount);
        try {
            yield timeout(delay);
            permission.shouldCreate = !permission.roleId;
            if (!permission.roleId) {
                permission.roleId = this.model.id;
            }
            yield permission.save();
            yield timeout(delay);
        } catch (e) {
            yield timeout(delay);
            this.updatePermissionState(moduleName, permission.resourceAlias, true, false);
        }
    })) updatePermissionTask

    /**
     * This function update the state of the permission by checking the result of the permission.
     * 
     * @param {String} moduleName
     * @param {String} resourceAlias
     * @param {boolean} isError
     * @param {boolean} isSuccessful
     * @method updatePermissionState
     */
    updatePermissionState(moduleName, resourceAlias, isError = null, isSuccessful = null) {
        (_.isBoolean(isError)) && (this.permissionsState[moduleName][resourceAlias].isErrored = isError);
        (_.isBoolean(isSuccessful)) && (this.permissionsState[moduleName][resourceAlias].isSuccessful = isSuccessful);
        this.permissionsState = { ...this.permissionsState };
    }

    /**
     * This function is used to return the permissions that are changed by user and to be updated in the next step.
     * 
     * @method getChangedPermissions
     * @param {String} moduleName The name of module.
     * @returns {Array}
     */
    getChangedPermissions(moduleName) {
        const permissions = this.model.permissions.reduce((permissions, permission) => {
            if ((permission.dirtyType === 'updated' || permission.isError)
                && permission.moduleName === moduleName) {
                permissions.push(permission);
            }
            return permissions;
        }, []);
        return permissions;
    }

    /**
     * This function shows success or failure messages once all of the (changed) permissions are updated.
     * 
     * @param {String} moduleName
     * @method showMessages
     */
    showMessages(moduleName) {
        let showSuccess = true;
        let moduleState = this.permissionsState[moduleName] || {};
        for (let [key, value] of Object.entries(moduleState)) {
            if (value.isErrored) {
                let permission = this.model.permissions.findBy('resourceName', key)
                || this.model.permissions.findBy('resourceName', `${moduleName}.${key}`)
                || this.model.permissions.findBy('resourceName', moduleName);
                new Messenger().post({
                    message: `${moduleName} (${key}) | ${permission.adapterError.detail.suggestion}`,
                    type: 'error',
                    showCloseButton: true
                });
                showSuccess = false;
            }
        }

        if (showSuccess) {
            new Messenger().post({
                message: this.intl.t('views.app.role.tabs.permission.updated'),
                type: 'success',
                showCloseButton: true
            });
        }
    }

    /**
     * This function is used to scroll the page to the first permission which got error on update.
     * 
     * @param {HTMLElement} moduleEl
     * @param {String} moduleName
     * @returns {Promise}
     */
    scrollToLatestCancelledPermission(moduleEl, moduleName) {
        let moduleState = this.permissionsState[moduleName] || {};
        for (let [key, value] of Object.entries(moduleState)) {
            if (value.isErrored) {
                let permissionEl = moduleEl.querySelector(`[data-module-resource="${key}"]`)
                || moduleEl.querySelector(`[data-module-resource="${moduleName}.${key}"]`)
                || moduleEl.querySelector(`[data-module-resource="${moduleName}"]`);
                if (permissionEl) {
                    return this.activateTabForPermission(permissionEl).then(() => {
                        this.scrollToPermission(permissionEl);
                    });
                }
                return Promise.resolve();
            }
        }
        return Promise.resolve();
    }

    /**
     * Ensure the Actions/Fields tab that owns the permission row is active
     * before scroll/highlight. Waits for Bootstrap's fade transition
     * (`shown.bs.tab`) so scroll uses the final layout.
     *
     * @param {HTMLElement} permissionEl
     * @method activateTabForPermission
     * @returns {Promise}
     */
    activateTabForPermission(permissionEl) {
        return new Promise((resolve) => {
            if (!permissionEl) {
                resolve();
                return;
            }

            let $pane = $(permissionEl).closest('.tab-pane');
            if (!$pane.length || $pane.hasClass('active')) {
                resolve();
                return;
            }

            let paneId = $pane.attr('id');
            if (!paneId) {
                resolve();
                return;
            }

            let $tab = $(permissionEl)
                .closest('[data-permission-module]')
                .find(`.nav-tabs a[href="#${paneId}"]`);

            if (!$tab.length) {
                resolve();
                return;
            }

            $tab.one('shown.bs.tab', () => resolve());
            $tab.tab('show');
        });
    }

    /**
     * This function is used to calculate the delay time according to the number of permissions being updated. If the
     * permissions count is closer to threshold e.g. 28, then delay time will be decreased to 0.1 -0.2 sec and if the permissions
     * count is far away from threshold e.g. 2 then delay time will be around 0.9 - 1 sec.
     * 
     * @param {Number} permissionsCount Count of permissions that are to be updated.
     * @method getDelay
     * @returns {Number}
     */
    getDelay(permissionsCount) {
        let maxDelay = 1,
            minDelay = 0.1,
            thresholdPermissions = 30;
        let delay = Number((maxDelay - (maxDelay - minDelay) / (thresholdPermissions - 1) * Math.min(permissionsCount, thresholdPermissions - 1)).toFixed(2)) * 1000;
        return delay;
    }

    /**
     * This function is used to scroll the page to the given permission element.
     * 
     * @param {HTMLElement} permissionEl 
     * @method scrollToPermission
     */
    scrollToPermission(permissionEl) {
        if (!permissionEl) {
            return;
        }

        let $el = $(permissionEl);
        let offset = $el.offset();
        if (!offset) {
            return;
        }

        let position = offset.top - ($el.height() * 1) - 10;
        $("html, body").animate({
            scrollTop: position
        }, 500);
    }

    /**
     * This property return list of userroles against the query given by the user.
     * 
     * @property filteredUserroles
     * @return Array
     */
    @computed('userroles.length', 'userSearchQuery')
    get filteredUserroles() {
        return this.userroles.filter((userrole) => {
            return userrole.user?.get('name')?.toLowerCase()?.includes(this.userSearchQuery)
                || userrole.user?.get('name')?.includes(this.userSearchQuery);
        });
    }

    /**
     * This method is used to remove a user's role assignment.
     * 
     * @method deleteUserrole
     * @param {Prometheus.Model.Userrole} userrole
     */
    @action deleteUserrole(userrole) {
        Logger.debug('App.Role.Page->deleteUserrole');
        let _self = this;

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.role.tabs.user.confirmdelete", {
                user: userrole.user.get('name')
            })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("global.form.confirmcancel")).toString(),
                    action: function () {
                        userrole.destroyRecord().then(function () {
                            _self.userroles.removeObject(userrole);
                            return deleting.update({
                                message: htmlSafe(_self.intl.t("global.form.deleted")).toString(),
                                type: 'success',
                                actions: false
                            });
                        });
                    }
                },
                cancel: {
                    label: htmlSafe(_self.intl.t("global.form.cancel")).toString(),
                    action: function () {
                        return deleting.update({
                            message: _self.intl.t("global.form.deletecancel"),
                            type: 'success',
                            actions: false
                        });
                    }
                },

            }
        });

        Logger.debug('App.Role.Page->deleteUserrole');
    }

    /**
     * This function is used to show the add userrole modal dialog box by setting
     * the addUserroleDialog flag to true.
     *
     * @method showAddUserroleDialog
     * @protected
     */
    @action showAddUserroleDialog() {
        this.addUserroleDialog = true;
    }

    /**
     * This function is used to hide the add userrole modal
     *
     * @method removeModal
     * @protected
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.addUserroleDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This function is used to assign this role to a user via userrole.
     *
     * @method addUserrole
     * @protected
     */
    @action addUserrole() {
        Logger.debug('AppRolePageController:addUserrole()');
        let _self = this;
        let newUserrole = _self.newUserrole;
        return this.validate(newUserrole, 'userroleCreate')
            .then(async (validation) => {
                if (validation.isValid) {
                    await this._addUserrole(this.newUserrole);
                    _self.removeModal();
                } else {
                    let messages = _self._buildMessages(validation.errors, 'userrole');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
            })
            .finally(() => {
                Logger.debug('-AppRolePageController:addUserrole()');
            });
    }

    /**
     * This function is used to create a new userrole assignment.
     * 
     * @param {Prometheus.Models.Userrole} newUserrole 
     */
    async _addUserrole(newUserrole) {
        let _self = this;

        try {
            const userrole = await newUserrole.save();
            Logger.debug('A new userrole has been saved');

            let user = _self.store.peekRecord('user', userrole.userId);
            userrole.user = user;
            _self.userroles.pushObject(userrole);

            new Messenger().post({
                message: _self.intl.t('views.app.role.tabs.user.userrole.created', {
                    user: user?.get('name')
                }),
                type: 'success',
                showCloseButton: true
            });

            _self.set('newUserrole', _self.store.createRecord('userrole', {
                roleId: userrole.roleId,
                userId: userrole.userId
            }));
        } catch (e) {
            e.errors?.forEach((message) => {
                new Messenger().post({
                    message: message,
                    type: 'error',
                    showCloseButton: true
                });
            });
        }
    }
}
