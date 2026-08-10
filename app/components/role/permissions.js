/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

/**
 * Field ACL modes administered in the role UI. API stores one row per field
 * (`issue.subject` + allowed none|read|write); backend expands to get/create/update.
 */
const FIELD_ACCESS_NONE = 'none';
const FIELD_ACCESS_READ = 'read';
const FIELD_ACCESS_WRITE = 'write';

const MODULE_ACTIONS = ['get', 'create', 'update', 'delete'];

/**
 * Stable column order for module action rows.
 */
const ACTION_ORDER = {
    get: 0,
    create: 1,
    update: 2,
    delete: 3
};

/**
 * ACL module → views.app.{module}.fields translation tree.
 * Some ACL resources use a different key than the UI i18n module.
 */
const FIELD_LABEL_MODULE_ALIASES = {
    conversationroom: 'conversation'
};

/**
 * Renders Actions / Fields permission lists as dense module rows.
 * Each module is one horizontal row with its action or field controls inline.
 *
 * @class RolePermissionsComponent
 * @namespace Prometheus.Components
 * @extends Glimmer.Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class RolePermissionsComponent extends Component {

    @service intl;

    /**
     * Bumped when field access modes change so getters recompute from dirty models.
     *
     * @property fieldAccessRevision
     * @type {number}
     */
    @tracked fieldAccessRevision = 0;

    /**
     * Action permissions grouped as one row per module.
     *
     * @returns {Array<{name: string, label: string, controls: Array}>}
     */
    get actionPermissionModules() {
        return this.groupPermissionsByModule(
            this.flatPermissions.filter((permission) => this.isModuleActionPermission(permission)),
            (permission) => this.wrapActionControl(permission),
            (a, b) => (ACTION_ORDER[a.resourceAlias] ?? 99) - (ACTION_ORDER[b.resourceAlias] ?? 99)
        );
    }

    /**
     * Field-mode permissions grouped as one row per module.
     *
     * @returns {Array<{name: string, label: string, controls: Array}>}
     */
    get fieldPermissionModules() {
        void this.fieldAccessRevision;

        return this.groupPermissionsByModule(
            this.flatPermissions.filter((permission) => this.isFieldModePermission(permission)),
            (permission) => {
                let parts = (permission.resourceName || '').split('.');
                let moduleName = parts[0];
                let field = parts.slice(1).join('.');
                return {
                    field,
                    moduleName,
                    displayLabel: this.resolveFieldLabel(moduleName, field),
                    accessMode: this.resolveAccessMode(permission.allowed),
                    permission,
                    resourceName: permission.resourceName,
                    resourceAlias: permission.resourceAlias
                };
            },
            (a, b) => a.field.localeCompare(b.field)
        );
    }

    /**
     * Flatten module-grouped permissions from the controller.
     *
     * @returns {Array}
     */
    get flatPermissions() {
        let byModule = this.args.permissionsByModule || {};
        let permissions = [];

        Object.keys(byModule).forEach((moduleName) => {
            (byModule[moduleName] || []).forEach((permission) => {
                permissions.push(permission);
            });
        });

        return permissions;
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
     * Group permissions into module rows with localized headings.
     *
     * @param {Array} permissions
     * @param {Function} mapControl
     * @param {Function} sortControls
     * @returns {Array<{name: string, label: string, controls: Array}>}
     */
    groupPermissionsByModule(permissions, mapControl, sortControls) {
        let byModule = {};

        permissions.forEach((permission) => {
            let moduleName = permission.moduleName || (permission.resourceName || '').split('.')[0];
            if (!moduleName) {
                return;
            }
            if (!byModule[moduleName]) {
                byModule[moduleName] = [];
            }
            byModule[moduleName].push(mapControl(permission));
        });

        return Object.keys(byModule)
            .sort((a, b) => a.localeCompare(b))
            .map((moduleName) => ({
                name: moduleName,
                label: this.resolveModuleLabel(moduleName),
                controls: byModule[moduleName].sort(sortControls)
            }));
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
     * Wrap an action permission for an inline module-row control.
     *
     * @param {Object} permission
     * @returns {{permission: Object, displayLabel: string, resourceName: string, moduleName: string, resourceAlias: string}}
     */
    wrapActionControl(permission) {
        return {
            permission,
            displayLabel: this.resolveActionControlLabel(permission.resourceAlias),
            resourceName: permission.resourceName,
            moduleName: permission.moduleName,
            resourceAlias: permission.resourceAlias
        };
    }

    /**
     * Short control label for module action columns (Get / Create / …).
     *
     * @param {string} action
     * @returns {string}
     */
    resolveActionControlLabel(action) {
        let key = `views.app.role.tabs.permission.actionLabels.${action}`;
        try {
            if (typeof this.intl.exists !== 'function' || this.intl.exists(key)) {
                return this.intl.t(key);
            }
        } catch (e) {
            // fall through
        }
        return action;
    }

    /**
     * Localized module heading for a permission group.
     *
     * @param {string} moduleName
     * @returns {string}
     */
    resolveModuleLabel(moduleName) {
        let moduleKey = `views.app.role.tabs.permission.modules.${moduleName}`;
        try {
            if (typeof this.intl.exists !== 'function' || this.intl.exists(moduleKey)) {
                return this.intl.t(moduleKey);
            }
        } catch (e) {
            // fall through
        }
        return moduleName;
    }

    /**
     * Label for a field permission control within a module row.
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
     * @param {Object} control field control entry
     * @param {Event} evt
     */
    @action setFieldAccessMode(control, evt) {
        let mode = evt.target.value;
        if (![FIELD_ACCESS_NONE, FIELD_ACCESS_READ, FIELD_ACCESS_WRITE].includes(mode)) {
            return;
        }

        let permission = control.permission;
        if (!permission) {
            return;
        }

        permission.allowed = mode;
        this.fieldAccessRevision = this.fieldAccessRevision + 1;
    }

    /**
     * Save all dirty permissions for the role.
     *
     * @method updatePermission
     * @public
     */
    @action updatePermission() {
        return this.args.updatePermission.perform();
    }
}
