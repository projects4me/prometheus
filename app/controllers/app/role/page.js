/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoleController from 'prometheus/controllers/app/role';
import { action, computed } from '@ember/object';
import * as Yup from 'yup';
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
     * This flag is used to show or hide the modal dialog box for adding new memberships
     * in the system.
     *
     * @property addRoleDialog
     * @type bool
     * @for AppRoleController
     * @private
     */
    @tracked addMembershipDialog = false;

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
     * This property maintain the list of projects that user selects.
     * 
     * @property selectedProjects
     * @type Array
     */
    @tracked selectedProjects = [];

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
                name: "membershipCreate",
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
                    },
                    {
                        name: "hasProjects",
                        validations: {
                            default: {
                                type: "lazy",
                                cb: this.validateMembershipField()
                            }
                        }
                    },
                    {
                        name: "relatedTo",
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
     * @param {String} moduleName
     * @param {String} flag
     * @param {String} roleId
     * @param {Event} evt
     * @protected
     */
    @(task(function* (moduleName) {
        let moduleEl = document.querySelector(`[data-permission-module="${moduleName}"]`);
        let permissions = this.getChangedPermissions(moduleName);

        for (let i = 0; i < permissions.length; i++) {
            let permission = permissions.objectAt(i);

            let permissionEl = moduleEl.querySelector(`[data-module-resource="${permission.resourceName}"]`);
            permissionEl.classList.add("light-gray");

            this.permissionsState[moduleName] = this.permissionsState[moduleName] || {};
            this.scrollToPermission(permissionEl)
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
            permissionEl.classList.remove("light-gray");

            // Destroy resource's permission state
            _.unset(this.permissionsState[moduleName], permission.resourceAlias);
        }

        this.scrollToLatestCancelledPermission(moduleEl, moduleName);
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
            !(permission.roleId)
                && (permission.roleId = this.model.id);
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
        let position = ($(permissionEl).offset().top)
            - ($(permissionEl).height() * 1) - 10;
        $("html, body").animate({
            scrollTop: position
        }, 500);
    }

    /**
     * This property return list of memberships against the query given by the user.
     * 
     * @property filteredRoles
     * @return Array
     */
    @computed('memberships.length', 'userSearchQuery')
    get filteredMemberships() {
        return this.memberships.filter((membership) => {
            return membership.user?.get('name')?.toLowerCase()?.includes(this.userSearchQuery)
                || membership.user?.get('name')?.includes(this.userSearchQuery);
        });
    }

    /**
     * This method is used to remove user's membership associated with role.
     * 
     * @method removeMembership
     * @param {Prometheus.Model.Membership} membership
     */
    @action deleteMembership(membership) {
        Logger.debug('App.Role.Page->deleteMembership');
        let _self = this;

        let deleting = new Messenger().post({
            message: htmlSafe(_self.intl.t("views.app.role.tabs.user.confirmdelete", {
                user: membership.user.get('name'),
                project: membership.project.get('name')
            })),
            type: 'warning',
            showCloseButton: true,
            actions: {
                confirm: {
                    label: htmlSafe(_self.intl.t("global.form.confirmcancel")).toString(),
                    action: function () {

                        // destroy the membership record
                        membership.destroyRecord().then(function () {
                            _self.memberships.removeObject(membership);
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

        Logger.debug('App.Role.Page->deleteMembership');
    }

    /**
     * This function is used to show the add membership modal dialog box by setting
     * the addMembershipDialog flag to true.
     *
     * @method showAddMembershipDialog
     * @protected
     */
    @action showAddMembershipDialog() {
        this.addMembershipDialog = true;
    }

    /**
     * This function is used to hide the add membership modal
     *
     * @method removeModal
     * @protected
     */
    @action removeModal() {
        if (this.isDestroyed || this.isDestroying) return;
        this.addMembershipDialog = false;
        $('.modal').modal('hide');
    }

    /**
     * This is a computed property which gets list of projects from the App controller.
     *
     * @property projectsList
     * @type Array
     * @for AppRolePageController
     * @private
     */
    @computed('appController.projectsList')
    get projectsList() {
        return this.appController.get('projectsList');
    }

    /**
     * This get property returns list of relatedTo objects.
     * 
     * @property relatedToList
     * @returns Array
     * @for AppRolePageController
     * @private
     */
    get relatedToList() {
        return [
            {
                label: this.intl.t("views.app.role.tabs.user.membership.relatedTo.system"),
                value: "system"
            },
            {
                label: this.intl.t("views.app.role.tabs.user.membership.relatedTo.project"),
                value: "project"
            }
        ]
    }

    /**
     * This function is triggered before the validation is performed against the model.
     * 
     * @method beforeValidate
     * @param {Prometheus.Models.*} model 
     */
    beforeValidate(model) {
        let modelType = model.get('constructor.modelName');

        if (modelType === 'membership') {
            if (!(this.selectedProjects != undefined &&
                this.selectedProjects.length > 0)) {
                this.newMembership.set('hasProjects', '');
            } else {
                this.newMembership.set('hasProjects', true);
            }
        }
    }

    /**
     * This function is used when validation is performed against the relatedId and hasProjects property
     * of Membership model. If the relatedTo property value is set to "system" then relatedId and hasProjects
     * property of Membership is not required.
     * 
     * @method validateMembershipField
     * @protected
     * @returns {function} Validation callback.
     */
    validateMembershipField() {
        return () => {
            let validationRule = null;
            validationRule = (this.newMembership.relatedTo === 'system')
                ? Yup['string']()['notRequired']()
                : Yup['string']()['required']()

            return validationRule;
        }
    }

    /**
     * This function is used to add one or more memberships in the system. If the relatedTo property of membership model is set to
     * system then a single membership is created. When relatedTo is set to project then there is possibility that user has selected
     * multiple projects, so in this case we'll create multiple memberships.
     *
     * @method addMembership
     * @protected
     */
    @action addMembership() {
        Logger.debug('AppRolePageController:addMembership()');
        let _self = this;
        let newMembership = _self.newMembership;
        this.validate(newMembership, 'membershipCreate')
            .then(async (validation) => {
                if (validation.isValid) {
                    if (this.newMembership.relatedTo === 'system') {
                        await this._addMembership(this.newMembership);
                    } else {
                        for (const project of this.selectedProjects) {
                            // Project contains label and value | a value from <option>
                            let membership = this.newMembership;
                            membership.relatedId = project.value;
                            await this._addMembership(membership);
                        }
                    }

                    _self.removeModal();
                    _self.selectedProjects = [];
                } else {
                    let messages = _self._buildMessages(validation.errors, 'membership');

                    new Messenger().post({
                        message: messages,
                        type: 'error',
                        showCloseButton: true
                    });
                }
            });
        Logger.debug('-AppRolePageController:addMembership()');
    }

    /**
     * This function is used to add a new membership in the system.
     * 
     * @param {Prometheus.Models.Membership} newMembership 
     */
    async _addMembership(newMembership) {
        let _self = this;

        try {
            const membership = await newMembership.save();
            Logger.debug('A new membership has been saved');

            let user = _self.store.peekRecord('user', membership.userId);
            membership.user = user;

            // Setting project relationship for membership model.
            if (membership.relatedTo !== 'system') {
                let relatedModel = _self.store.peekRecord(membership.relatedTo, membership.relatedId);
                membership.project = relatedModel;
            }
            _self.memberships.pushObject(membership);

            new Messenger().post({
                message: _self.intl.t(`views.app.role.tabs.user.membership.created.${membership.relatedTo}`, { name: membership.project.get('name') }),
                type: 'success',
                showCloseButton: true
            });

            _self.set('newMembership', _self.store.createRecord('membership', {
                roleId: membership.roleId,
                relatedTo: membership.relatedTo,
                userId: membership.userId
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