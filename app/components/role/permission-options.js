/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

/**
 * This component is used to render dropdown containing the list of available options
 * that the permission have.
 *
 * @class RolePermissionOptionsComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RolePermissionOptionsComponent extends Component {

    /**
     * The option matching the permission's current value.
     *
     * @property selectedOption
     * @type {{label: string, value: string}|undefined}
     */
    get selectedOption() {
        return (this.args.options || []).find((option) => String(option.value) === String(this.args.value));
    }

    /**
     * Update the access level of the permission from the chosen option.
     *
     * @param {Prometheus.Models.Permission} permission
     * @param {String} flag
     * @param {{value: String}} option
     * @method updateAccessLevel
     */
    @action updateAccessLevel(permission, flag, option) {
        if (!option) {
            return;
        }
        permission[flag] = option.value;
    }

    /**
     * Update the permission, then refresh the save button's disabled state.
     *
     * @param {Prometheus.Models.Permission} permission
     * @param {String} flag
     * @param {Function} updateDisableState
     * @param {{value: String}} option
     * @method updatePermission
     */
    @action updatePermission(permission, flag, updateDisableState, option) {
        this.updateAccessLevel(permission, flag, option);
        if (typeof updateDisableState === 'function') {
            updateDisableState(permission);
        }
    }
}
