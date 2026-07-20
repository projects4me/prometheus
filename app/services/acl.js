/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 * ACL service: model + action flag checks against the current user's permissions.
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
     * Map of Ember route names to Model.action ACL contexts.
     *
     * @property routeMaps
     * @type array
     * @public
     */
    routeMaps = [
        { name: 'app.index', map: null },
        { name: 'app.projects.index', map: 'Project.read' },
        { name: 'app.projects.create', map: 'Project.create' },
        { name: 'app.projects.edit', map: 'Project.update' },
        { name: 'app.project.index', map: 'Project.read' },
        { name: 'app.project.wiki.index', map: 'Wiki.read' },
        { name: 'app.project.wiki.create', map: 'Wiki.create' },
        { name: 'app.project.wiki.page', map: 'Wiki.read' },
        { name: 'app.project.wiki.edit', map: 'Wiki.update' },
        { name: 'app.project.conversation', map: 'Conversationroom.read' },
        { name: 'app.project.board', map: 'Issue.read' },
        { name: 'app.project.calendar', map: 'Issue.read' },
        { name: 'app.project.issue.index', map: 'Issue.read' },
        { name: 'app.project.issue.create', map: 'Issue.create' },
        { name: 'app.project.issue.page', map: 'Issue.read' },
        { name: 'app.project.issue.edit', map: 'Issue.update' },
        { name: 'app.user.page', map: 'User.read' },
        { name: 'app.user.create', map: 'User.create' },
        { name: 'app.user.index', map: 'User.read' },
        { name: 'app.user.management', map: 'User.update' },
        { name: 'app.admin.index', map: 'User.read' },
        { name: 'app.admin.create', map: 'User.create' },
        { name: 'app.admin.page', map: 'User.read' },
        { name: 'app.admin.edit', map: 'User.update' },
        { name: 'app.role.index', map: 'Role.read' },
        { name: 'app.role.page', map: 'Role.read' }
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
     * Action name → permission flag column.
     */
    actionFlagMap = {
        read: 'readF',
        create: 'createF',
        update: 'updateF',
        delete: 'deleteF',
        import: 'importF',
        export: 'exportF'
    };
    /**
    * Current user's ACL permissions (model entity + flags).
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
            return this.aclPermissions.some(p => this.isAllowedFlag(p, 'readF'));
        }
        return this.checkAccess(route.map);
    }

    /**
     * Check access for a Model.action context (e.g. Issue.create).
     * Undefined context is treated as allowed.
     * 
     * @param {string} context
     * @returns {boolean}
     */
    checkAccess(context) {
        if (context === undefined || context === null || context === '') {
            return true;
        }

        let [model, action] = String(context).split('.');
        if (!model || !action) {
            return false;
        }

        let flag = this.actionFlagMap[action];
        if (!flag) {
            return false;
        }

        let permission = this.aclPermissions.find(p => {
            let entity = p.get ? p.get('entity') : p.entity;
            return entity === model;
        });

        if (!permission) {
            return false;
        }

        return this.isAllowedFlag(permission, flag);
    }

    /**
     * Check if the permission is allowed for a given flag.
     * 
     * @param {Object} permission
     * @param {string} flag
     * @returns {boolean}
     */
    isAllowedFlag(permission, flag) {
        let value = permission.get ? permission.get(flag) : permission[flag];
        return value === 1 || value === '1' || value === true;
    }
}
