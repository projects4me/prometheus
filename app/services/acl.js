/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 * Template action → catalog action. `read` is the UI/permission verb;
 * the backend stores it as `get`.
 */
const ACTION_MAP = {
    read: 'get',
    get: 'get',
    create: 'create',
    update: 'update',
    delete: 'delete'
};

/**
 * ACL service: action-based checks against the current user's permissions.
 *
 * @class AclService
 * @namespace Prometheus.Services
 * @extends Ember.service
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class AclService extends Service {
    /**
     * The current user of the application
     *
     * @property currentUser
     * @type Ember.Service
     * @for AclService
     * @public
     */
    @service currentUser;

    /**
     * Map of Ember route names to {module}.{action} ACL contexts.
     * Uses `read` for read-only routes; normalizeContext maps it to `get`
     * before matching the backend catalog identity.
     *
     * @property routeMaps
     * @type array
     * @public
     */
    routeMaps = [
        { name: 'app.index', map: null },
        { name: 'app.projects.index', map: 'project.read' },
        { name: 'app.projects.create', map: 'project.create' },
        { name: 'app.projects.edit', map: 'project.update' },
        { name: 'app.project.index', map: 'project.read' },
        { name: 'app.project.wiki.index', map: 'wiki.read' },
        { name: 'app.project.wiki.create', map: 'wiki.create' },
        { name: 'app.project.wiki.page', map: 'wiki.read' },
        { name: 'app.project.wiki.edit', map: 'wiki.update' },
        { name: 'app.project.conversation', map: 'conversationroom.read' },
        { name: 'app.project.board', map: 'issue.read' },
        { name: 'app.project.calendar', map: 'issue.read' },
        { name: 'app.project.issue.index', map: 'issue.read' },
        { name: 'app.project.issue.create', map: 'issue.create' },
        { name: 'app.project.issue.page', map: 'issue.read' },
        { name: 'app.project.issue.edit', map: 'issue.update' },
        { name: 'app.user.page', map: 'user.read' },
        { name: 'app.user.create', map: 'user.create' },
        { name: 'app.user.index', map: 'user.read' },
        { name: 'app.user.management', map: 'user.update' },
        { name: 'app.admin.index', map: 'user.read' },
        { name: 'app.admin.create', map: 'user.create' },
        { name: 'app.admin.page', map: 'user.read' },
        { name: 'app.admin.edit', map: 'user.update' },
        { name: 'app.role.index', map: 'role.read' },
        { name: 'app.role.page', map: 'role.read' }
    ];

    /**
     * Routes that skip ACL checks.
     *
     * @property explicitRoutes
     * @type array
     * @public
     */
    explicitRoutes = [
        'signin.index'
    ];

    /**
     * Current user's ACL permissions (entity = resourceName + allowed).
     *
     * @method aclPermissions
     * @returns {Array}
     */
    @computed('this.currentUser.user')
    get aclPermissions() {
        let user = this.currentUser.user;
        if (!user || !user.aclPermissions) {
            return [];
        }
        return user.aclPermissions.toArray ? user.aclPermissions.toArray() : user.aclPermissions;
    }

    /**
     * Normalize an ACL context to catalog identity.
     * Supports `{module}.{action}` and `{module}.{field}.{action}`.
     * Templates use `read`; this maps it to `get` to match the backend catalog.
     *
     * @param {string} context
     * @returns {string|null}
     */
    normalizeContext(context) {
        if (context === undefined || context === null || context === '') {
            return null;
        }

        let parts = String(context).split('.');
        if (parts.length < 2) {
            return null;
        }

        let action = parts[parts.length - 1];
        let catalogAction = ACTION_MAP[action.toLowerCase()];
        if (!catalogAction) {
            return null;
        }

        if (parts.length === 2) {
            return `${parts[0].toLowerCase()}.${catalogAction}`;
        }

        // module.field.action (field may theoretically contain dots — join middle)
        let module = parts[0].toLowerCase();
        let field = parts.slice(1, -1).join('.');
        if (!field) {
            return null;
        }

        return `${module}.${field}.${catalogAction}`;
    }

    /**
     * Check access for an Ember route name.
     *
     * @param {string} routeName
     * @returns {boolean}
     */
    hasRouteAccess(routeName) {
        if (this.explicitRoutes.includes(routeName)) {
            return true;
        }

        let route = this.routeMaps.find(f => f.name === routeName);
        if (!route) {
            return true;
        }

        if (route.map === null) {
            return this.aclPermissions.some(permission => {
                let entity = permission.get ? permission.get('entity') : permission.entity;
                let allowed = permission.get ? permission.get('allowed') : permission.allowed;
                return typeof entity === 'string'
                    && entity.endsWith('.get')
                    && entity.split('.').length === 2
                    && (allowed === 1 || allowed === '1' || allowed === true);
            });
        }
        return this.checkAccess(route.map);
    }

    /**
     * Check access for `{module}.{action}` or `{module}.{field}.{action}`.
     * Field contexts require the matching module action first.
     * Missing or empty context, and resources with no ACL entry, are allowed.
     * When a permission exists for the resource, access follows its `allowed` flag.
     *
     * @param {string} context
     * @returns {boolean}
     */
    checkAccess(context) {
        if (context === undefined || context === null || context === '') {
            return true;
        }

        let resourceName = this.normalizeContext(context);
        if (!resourceName) {
            return true;
        }

        let parts = resourceName.split('.');
        if (parts.length === 3) {
            let moduleAction = `${parts[0]}.${parts[2]}`;
            if (!this._isResourceAllowed(moduleAction)) {
                return false;
            }
        }

        return this._isResourceAllowed(resourceName);
    }

    /**
     * Convenience helper for field ACL checks.
     *
     * @param {string} module
     * @param {string} field
     * @param {string} action read|get|create|update
     * @returns {boolean}
     */
    canField(module, field, action) {
        return this.checkAccess(`${module}.${field}.${action}`);
    }

    /**
     * Resolve allow/deny for a catalog resource name against aclPermissions.
     * Missing entry → allow (matches backend permissive default).
     *
     * @param {string} resourceName
     * @returns {boolean}
     * @private
     */
    _isResourceAllowed(resourceName) {
        let permission = this.aclPermissions.find(p => {
            let entity = p.get ? p.get('entity') : p.entity;
            return entity === resourceName;
        });

        if (!permission) {
            return true;
        }

        let allowed = permission.get ? permission.get('allowed') : permission.allowed;
        return allowed === 1 || allowed === '1' || allowed === true;
    }
}
