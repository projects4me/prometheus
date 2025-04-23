/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

/**
 * This component is used to render role's module permissions.
 *
 * @class RoleModulePermissionsComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RoleModulePermissionsComponent extends Component {

    /**
     * This property is used track the disabled state of the save button.
     * @property isDisabled
     * @for RoleModulePermissionsComponent
     * @private
     */
    @tracked isDisabled = true;

    /**
     * This function is triggered when user selects any new option from the list against the permission. It updates the state of the isDisabled 
     * tracked property when there is change in the permission model.
     *
     * @method updateChangeState
     * @param {Prometheus.Models.Permission} permission
     * @for RoleModulePermissionsComponent
     * @public
     */
    @action updateDisableState(permission) {
        this.isDisabled = !permission.hasDirtyAttributes;
    }

    /**
     * This function first calls the parent updatePermission action from AppRolePageController and after that calls resetDisableState
     * to again set the state of save button to disabled.
     *
     * @method updatePermission
     * @param {String} name
     * @for RoleModulePermissionsComponent
     * @public
     */
    @action updatePermission(name) {
        return this.args.updatePermission.perform(name);
    }
}
