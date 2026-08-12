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
     * Whether the View All role members modal is open.
     *
     * @property viewAllMembersDialog
     * @type bool
     * @for AppRolePageController
     * @private
     */
    @tracked viewAllMembersDialog = false;

    /**
     * Client-side search query for filtering members in the View All modal.
     *
     * @property membersSearchQuery
     * @type String
     * @for AppRolePageController
     * @private
     */
    @tracked membersSearchQuery = '';

    /**
     * Max members shown in the compact inline list before View All is offered.
     *
     * @property membersPreviewLimit
     * @type Number
     * @for AppRolePageController
     * @private
     */
    membersPreviewLimit = 10;

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
     * First N userroles for the inline members preview.
     *
     * @property previewUserroles
     * @return {Array}
     */
    @computed('userroles.[]', 'userroles.length', 'membersPreviewLimit')
    get previewUserroles() {
        let userroles = this.userroles || [];
        return userroles.slice(0, this.membersPreviewLimit);
    }

    /**
     * Whether membership exceeds the inline preview limit.
     *
     * @property showViewAllMembers
     * @return {Boolean}
     */
    @computed('userroles.length', 'membersPreviewLimit')
    get showViewAllMembers() {
        return (this.userroles?.length || 0) > this.membersPreviewLimit;
    }

    /**
     * Userroles listed in the View All modal, filtered by name/email search.
     *
     * @property filteredModalUserroles
     * @return {Array}
     */
    @computed('userroles.[]', 'userroles.length', 'membersSearchQuery')
    get filteredModalUserroles() {
        let userroles = this.userroles || [];
        let query = (this.membersSearchQuery || '').trim().toLowerCase();

        if (!query) {
            return userroles;
        }

        return userroles.filter((userrole) => {
            let user = userrole.user;
            let name = (user?.get?.('name') || user?.name || '').toLowerCase();
            let email = (user?.get?.('email') || user?.email || '').toLowerCase();
            return name.includes(query) || email.includes(query);
        });
    }

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
     * Close the role detail panel and return to the roles list.
     *
     * @method closeRoleDetail
     * @protected
     */
    @action closeRoleDetail() {
        this.router.transitionTo('app.role');
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
     * Save all dirty / errored permissions for the role.
     *
     * @method updatePermission
     * @protected
     */
    @(task(function* () {
        let listEl = document.querySelector('[data-role="permissions"]');
        let permissions = this.getChangedPermissions();

        if (!permissions.length) {
            return;
        }

        for (let i = 0; i < permissions.length; i++) {
            let permission = permissions.objectAt(i);
            let moduleName = permission.moduleName;

            this.permissionsState[moduleName] = this.permissionsState[moduleName] || {};

            let permissionEl = listEl
                ? listEl.querySelector(`[data-module-resource="${permission.resourceName}"]`)
                : null;
            if (permissionEl) {
                yield this.activateTabForPermission(permissionEl);
                permissionEl.classList.add("light-gray");
                this.scrollToPermission(permissionEl);
            }

            this.permissionsState[moduleName][permission.resourceAlias] = this.updatePermissionTask.perform(permission, moduleName, permissions.length);

            this.updatePermissionState(moduleName, permission.resourceAlias, null, null);
            yield this.permissionsState[moduleName][permission.resourceAlias];

            if (this.permissionsState[moduleName][permission.resourceAlias].isErrored) {
                this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
            }

            let delay = this.getDelay(permissions.length)
            yield timeout(delay);

            this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
            if (permissionEl) {
                permissionEl.classList.remove("light-gray");
            }

            _.unset(this.permissionsState[moduleName], permission.resourceAlias);
        }

        yield this.scrollToLatestCancelledPermission(listEl);
        this.showMessages();
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
     * Changed permissions that should be persisted on save.
     *
     * @method getChangedPermissions
     * @returns {Array}
     */
    getChangedPermissions() {
        const permissions = this.model.permissions.reduce((changed, permission) => {
            if (permission.dirtyType === 'updated' || permission.isError) {
                changed.push(permission);
            }
            return changed;
        }, []);
        return permissions;
    }

    /**
     * Show success or failure messages once all changed permissions are updated.
     *
     * @method showMessages
     */
    showMessages() {
        let showSuccess = true;

        Object.entries(this.permissionsState).forEach(([moduleName, moduleState]) => {
            Object.entries(moduleState || {}).forEach(([key, value]) => {
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
            });
        });

        if (showSuccess) {
            new Messenger().post({
                message: this.intl.t('views.app.role.tabs.permission.updated'),
                type: 'success',
                showCloseButton: true
            });
        }
    }

    /**
     * Scroll to the first permission that failed to update.
     *
     * @param {HTMLElement} listEl
     * @returns {Promise}
     */
    scrollToLatestCancelledPermission(listEl) {
        if (!listEl) {
            return Promise.resolve();
        }

        for (let [moduleName, moduleState] of Object.entries(this.permissionsState || {})) {
            for (let [key, value] of Object.entries(moduleState || {})) {
                if (value.isErrored) {
                    let permissionEl = listEl.querySelector(`[data-module-resource="${key}"]`)
                        || listEl.querySelector(`[data-module-resource="${moduleName}.${key}"]`)
                        || listEl.querySelector(`[data-module-resource="${moduleName}"]`);
                    if (permissionEl) {
                        return this.activateTabForPermission(permissionEl).then(() => {
                            this.scrollToPermission(permissionEl);
                        });
                    }
                    return Promise.resolve();
                }
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
                .closest('[data-role="permissions"]')
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
     * Calculate the delay time according to the number of permissions being updated.
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
     * Scroll the page to the given permission element.
     * Leaves extra space above so the highlight is not clipped by the sticky header.
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

        let topClearance = 120;
        let position = Math.max(offset.top - ($el.outerHeight() || 0) - topClearance, 0);
        $("html, body").animate({
            scrollTop: position
        }, 500);
    }

    /**
     * Remove a user's role assignment.
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
     * Show the add userrole modal dialog box.
     *
     * @method showAddUserroleDialog
     * @protected
     */
    @action showAddUserroleDialog(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        this.addUserroleDialog = true;
    }

    /**
     * Open the View All members modal with a cleared search field.
     *
     * @method showViewAllMembersDialog
     * @protected
     */
    @action showViewAllMembersDialog(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        this.membersSearchQuery = '';
        this.viewAllMembersDialog = true;
    }

    /**
     * Hide the add userrole modal.
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
     * Hide the View All members modal and clear search.
     *
     * @method removeViewAllMembersModal
     * @protected
     */
    @action removeViewAllMembersModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.viewAllMembersDialog = false;
        this.membersSearchQuery = '';
        $('.modal').modal('hide');
    }

    /**
     * Assign this role to a user via userrole.
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
     * Create a new userrole assignment.
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
