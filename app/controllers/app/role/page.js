/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import AppRoleController from 'prometheus/controllers/app/role';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

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
                let name = (permission.resourceName.split('.'))[0];
                if (modelName === name) {
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
        return [
            "readF",
            "createF",
            "searchF",
            "updateF",
            "deleteF",
            "importF",
            "exportF"
        ];
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
}