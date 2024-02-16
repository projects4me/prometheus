/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoleController from 'prometheus/controllers/app/role';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import { task, timeout } from 'ember-concurrency';

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
     * This object maintains all of the permissions state that are updated by the user.
     * 
     * @property permissionsState
     * @protected
     */
    @tracked permissionsState = {};

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
     * This method returns the role permissions by creating the associative array containing the key
     * as the module name and there permissions.
     * 
     * @property permissions
     * @protected
     */
    @computed('model.permissions')
    get permissions() {
        let rolesPermissions = {};
        let permissions = this.model.permissions;
        let modelsList = permissions.reduce((models, permission) => {
            if (!permission.resourceName.includes('.')) {
                models.push(permission.resourceName);
            }
            return models;
        }, []);


        //add childs (fields, relationships) inside the parent.
        modelsList.forEach((modelName) => {
            let modelPermissions = permissions.filter((permission) => {
                let [model, fieldName] = permission.resourceName.split('.');
                if (modelName === model) {
                    permission.resourceAlias = fieldName ?? model;
                    permission.moduleName = modelName;
                    return permission;
                }
            });

            rolesPermissions[modelName] = modelPermissions;
        });
        return rolesPermissions;
    }

    /**
     * This returns the all of the permission flags.
     * 
     * @property permissionFlags
     * @protected
     */
    get permissionFlags() {
        return (this.settings.get('aclSettings')).permissionFlags;
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
     * @param {string} moduleName
     * @param {string} flag
     * @param {string} roleId
     * @param {Event} evt
     * @protected
     */
    @(task(function* (moduleName) {
        let moduleEl = document.querySelector(`[data-permission-module="${moduleName}"]`);

        for (let i = 0; i < this.model.permissions.length; i++) {
            let permission = this.model.permissions.objectAt(i);

            if (permission.dirtyType === 'updated' || permission.isError) {
                let permissionEl = moduleEl.querySelector(`[data-module-resource="${permission.resourceName}"]`);
                let backgroundColor = permissionEl.style.background;
                permissionEl.style.background = 'lightgray';

                this.permissionsState[moduleName] = this.permissionsState[moduleName] || {};
                this.scrollToPermission(permissionEl)
                this.permissionsState[moduleName][permission.resourceAlias] = this.updatePermissionTask.perform(permission, moduleName);

                this.updatePermissionState(moduleName, permission.resourceAlias, null, null);
                yield this.permissionsState[moduleName][permission.resourceAlias];
                if (this.permissionsState[moduleName][permission.resourceAlias].isErrored) {
                    this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
                }
                yield timeout(500);
                this.updatePermissionState(moduleName, permission.resourceAlias, null, false);
                permissionEl.style.background = backgroundColor;
            }
        }

        this.scrollToLatestCancelledPermission(moduleEl, moduleName);
        yield timeout(500);
        this.showMessages(moduleName);
    })) updatePermission

    /**
     * This task is used to update the permission model.
     * 
     * @param {Prometheus.Model.Permission} permission
     * @param {string} moduleName
     * @method updatePermissionTask
     */
    @(task(function* (permission, moduleName) {
        try {
            yield timeout(1000);
            yield permission.save();
            yield timeout(1000);
        } catch (e) {
            yield timeout(1000);
            this.updatePermissionState(moduleName, permission.resourceAlias, true, false);
        }
    })) updatePermissionTask

    /**
     * This function update the state of the permission by checking the result of the permission.
     * 
     * @param {string} moduleName
     * @param {string} resourceAlias
     * @param {boolean} isError
     * @param {boolean} isSuccessful
     * @method updatePermissionState
     */
    updatePermissionState(moduleName, resourceAlias, isError = null, isSuccessful = null) {
        (_.isBoolean(isError)) && (this.permissionsState[moduleName][resourceAlias].isErrored = true);
        (_.isBoolean(isSuccessful)) && (this.permissionsState[moduleName][resourceAlias].isSuccessful = false);
        this.permissionsState = { ...this.permissionsState };
    }

    /**
     * This function shows success or failure messages once all of the (changed) permissions are updated.
     * 
     * @param {string} moduleName
     * @method showMessages
     */
    showMessages(moduleName) {
        let showSuccess = true;
        for (let [key, value] of Object.entries(this.permissionsState[moduleName])) {
            if (value.isErrored) {
                let permission = this.model.permissions.findBy('resourceName', `${moduleName}.${key}`);
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
                message: this.intl.t('views.app.role.permissions.updated'),
                type: 'success',
                showCloseButton: true
            });
        }
    }

    /**
     * This function is used to scroll the page to the first permission which got error on update.
     * 
     * @param {HTMLElement} moduleEl
     * @param {string} moduleName
     * @returns {null}
     */
    scrollToLatestCancelledPermission(moduleEl, moduleName) {
        for (let [key, value] of Object.entries(this.permissionsState[moduleName])) {
            if (value.isErrored) {
                let permissionEl = moduleEl.querySelector(`[data-module-resource="${moduleName}.${key}"]`);
                this.scrollToPermission(permissionEl);
                return;
            }
        }
    }

    /**
     * This function is used to scroll the page to the given permission element.
     * 
     * @param {HTMLElement} permissionEl 
     * @method scrollToPermission
     */
    scrollToPermission(permissionEl) {
        let position = ($(permissionEl).offset().top)
            - ($(permissionEl).height() * 1) - 10;
        $("html, body").animate({
            scrollTop: position
        }, 500);
    }
}