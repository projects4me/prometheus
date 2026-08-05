/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import $ from 'jquery';

/**
 * Field ACL modes administered in the role UI. API stores one row per field
 * (`issue.subject` + allowed none|read|write); backend expands to get/create/update.
 */
const FIELD_ACCESS_NONE = 'none';
const FIELD_ACCESS_READ = 'read';
const FIELD_ACCESS_WRITE = 'write';

const MODULE_ACTIONS = ['get', 'create', 'update', 'delete'];

/**
 * ACL module → views.app.{module}.fields translation tree.
 * Some ACL resources use a different key than the UI i18n module.
 */
const FIELD_LABEL_MODULE_ALIASES = {
    conversationroom: 'conversation'
};

/**
 * This component is used to render role's module permissions.
 *
 * @class RoleModulePermissionsComponent
 * @namespace Prometheus.Components
 * @extends Ember.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RoleModulePermissionsComponent extends Component {

    @service intl;

    /**
     * This property is used track the disabled state of the save button.
     * @property isDisabled
     * @for RoleModulePermissionsComponent
     * @private
     */
    @tracked isDisabled = true;

    /**
     * Bumped when field access modes change so getters recompute from dirty models.
     *
     * @property fieldAccessRevision
     * @type {number}
     */
    @tracked fieldAccessRevision = 0;

    /**
     * Module-level action permissions (`issue.get`, etc.).
     *
     * @returns {Array<{permission: Object, displayLabel: string}>}
     */
    get actionPermissions() {
        let permissions = this.args.modulePermissions || [];
        return permissions
            .filter((permission) => this.isModuleActionPermission(permission))
            .map((permission) => this.wrapPermission(permission));
    }

    /**
     * Field-mode permissions (`issue.subject` + allowed none|read|write).
     *
     * @returns {Array<{field: string, displayLabel: string, accessMode: string, permission: Object}>}
     */
    get fieldPermissionGroups() {
        void this.fieldAccessRevision;

        let permissions = this.args.modulePermissions || [];
        let groups = [];

        permissions.forEach((permission) => {
            if (!this.isFieldModePermission(permission)) {
                return;
            }
            let parts = (permission.resourceName || '').split('.');
            let moduleName = parts[0];
            let field = parts.slice(1).join('.');
            groups.push({
                field,
                moduleName,
                displayLabel: this.resolveFieldLabel(moduleName, field),
                accessMode: this.resolveAccessMode(permission.allowed),
                permission
            });
        });

        return groups.sort((a, b) => a.field.localeCompare(b.field));
    }

    /**
     * Options for the field access mode select.
     *
     * @returns {Array<{label: string, value: string}>}
     */
    get fieldAccessOptions() {
        return [
            {
                label: this.intl.t('views.app.role.tabs.permission.options.none'),
                value: FIELD_ACCESS_NONE
            },
            {
                label: this.intl.t('views.app.role.tabs.permission.options.readOnly'),
                value: FIELD_ACCESS_READ
            },
            {
                label: this.intl.t('views.app.role.tabs.permission.options.writeRead'),
                value: FIELD_ACCESS_WRITE
            }
        ];
    }

    /**
     * @param {Object} permission
     * @returns {boolean}
     */
    isModuleActionPermission(permission) {
        let parts = (permission.resourceName || '').split('.');
        return parts.length === 2 && MODULE_ACTIONS.includes(parts[1]);
    }

    /**
     * @param {Object} permission
     * @returns {boolean}
     */
    isFieldModePermission(permission) {
        let parts = (permission.resourceName || '').split('.');
        return parts.length === 2 && !MODULE_ACTIONS.includes(parts[1]);
    }

    /**
     * Map stored/API allowed to a select value. Unset → Write + Read (permissive).
     *
     * @param {*} allowed
     * @returns {string}
     */
    resolveAccessMode(allowed) {
        if (allowed === FIELD_ACCESS_NONE || allowed === FIELD_ACCESS_READ || allowed === FIELD_ACCESS_WRITE) {
            return allowed;
        }
        return FIELD_ACCESS_WRITE;
    }

    /**
     * Wrap a permission model with a precomputed display label for the template.
     *
     * @param {Object} permission
     * @returns {{permission: Object, displayLabel: string, resourceName: string, moduleName: string, resourceAlias: string}}
     */
    wrapPermission(permission) {
        return {
            permission,
            displayLabel: this.resolvePermissionLabel(permission),
            resourceName: permission.resourceName,
            moduleName: permission.moduleName,
            resourceAlias: permission.resourceAlias
        };
    }

    /**
     * Label for a permission row; falls back to resourceName when i18n missing.
     *
     * @param {Object} permission
     * @returns {string}
     */
    resolvePermissionLabel(permission) {
        let key = `views.app.role.tabs.permission.labels.${permission.resourceName}`;
        if (typeof this.intl.exists === 'function' && !this.intl.exists(key)) {
            return permission.resourceName;
        }
        try {
            return this.intl.t(key);
        } catch (e) {
            return permission.resourceName;
        }
    }

    /**
     * Label for a field permission row.
     * Prefers views.app.{module}.fields.{field}, then
     * views.app.role.tabs.permission.labels.{module}.{field},
     * then the raw field name.
     *
     * @param {string} moduleName
     * @param {string} field
     * @returns {string}
     */
    resolveFieldLabel(moduleName, field) {
        let translationModule = FIELD_LABEL_MODULE_ALIASES[moduleName] || moduleName;
        let candidates = [
            `views.app.${translationModule}.fields.${field}`,
            `views.app.role.tabs.permission.labels.${moduleName}.${field}`
        ];

        for (let i = 0; i < candidates.length; i++) {
            let key = candidates[i];
            if (typeof this.intl.exists === 'function' && !this.intl.exists(key)) {
                continue;
            }
            try {
                return this.intl.t(key);
            } catch (e) {
                // try next candidate
            }
        }

        return field;
    }

    /**
     * Apply a field access mode onto the single field-mode permission row.
     *
     * @method setFieldAccessMode
     * @param {Object} group fieldPermissionGroups entry
     * @param {Event} evt
     */
    @action setFieldAccessMode(group, evt) {
        let mode = evt.target.value;
        if (![FIELD_ACCESS_NONE, FIELD_ACCESS_READ, FIELD_ACCESS_WRITE].includes(mode)) {
            return;
        }

        let permission = group.permission;
        if (!permission) {
            return;
        }

        permission.allowed = mode;
        this.isDisabled = !permission.hasDirtyAttributes;
        this.fieldAccessRevision = this.fieldAccessRevision + 1;
    }

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

    /**
     * Collapse this module's accordion panel.
     *
     * @method close
     * @for RoleModulePermissionsComponent
     * @public
     */
    @action close() {
        let panelId = this.args.name;
        if (!panelId) {
            return;
        }

        let $panel = $(`#${panelId}`);
        if ($panel.length) {
            $panel.collapse('hide');
        }
    }
}
