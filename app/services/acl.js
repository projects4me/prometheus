/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';

/**
 * The acl service maintain resources on which user has access to.
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
     * This contains the mapping of the acl resources against route names (ember specific). 
     * @property routeMaps
     * @type array
     * @public
     */
    routeMaps = [
        {
            name: 'app.index', // the route name, user is transiting to.
            map: 'App' // acl map
        },
        {
            name: 'app.projects.index',
            map: 'Route.Project.List'
        },
        {
            name: 'app.projects.create',
            map: 'Route.Project.Create'
        },
        {
            name: 'app.projects.edit',
            map: 'Route.Project.Edit'
        },
        {
            name: 'app.project.index',
            map: 'Route.Project.Read'
        },
        {
            name: 'app.project.wiki.index',
            map: 'Route.Wiki.List'
        },
        {
            name: 'app.project.wiki.create',
            map: 'Route.Wiki.Create'
        },
        {
            name: 'app.project.wiki.page',
            map: 'Route.Wiki.Read'
        },
        {
            name: 'app.project.wiki.edit',
            map: 'Route.Wiki.Edit'
        },
        {
            name: 'app.project.conversation',
            map: 'Route.Project.Conversation'
        },        
        {
            name: 'app.project.board',
            map: 'Route.Project.Board'
        },
        {
            name: 'app.project.calendar',
            map: 'Route.Project.Calendar'
        },
        {
            name: 'app.project.issue.index',
            map: 'Route.Issue.List'
        },
        {
            name: 'app.project.issue.create',
            map: 'Route.Issue.Create'
        },
        {
            name: 'app.project.issue.page',
            map: 'Route.Issue.Read'
        },
        {
            name: 'app.project.issue.edit',
            map: 'Route.Issue.Edit'
        },
        {
            name: 'app.user.page',
            map: 'Route.User.Read'
        },
        {
            name: 'app.user.create',
            map: 'Route.User.Create'
        },
        {
            name: 'app.user.index',
            map: 'Route.User.List'
        },
        {
            name: 'app.user.edit',
            map: 'Route.User.Edit'
        },
        {
            name: 'app.user.management',
            map: 'Route.User.Management'
        },
        {
            name: 'app.admin.index',
            map: 'Route.Admin.List'
        },
        {
            name: 'app.admin.create',
            map: 'Route.Admin.Create'
        },
        {
            name: 'app.admin.page',
            map: 'Route.Admin.Read'
        },
        {
            name: 'app.admin.edit',
            map: 'Route.Admin.Edit'
        }
    ];

    /**
     * This method return list of the resources of the application on which 
     * user has access.
     * 
     * @method allowedResources
     * @returns array
     */
    @computed('this.currentUser.user')
    get allowedResources() {
        let permissions = this.currentUser.user.aclPermissions;
        return permissions.map(permission => permission.entity);
    }

    /**
     * This method check the user access on the given route.
     * 
     * @param {string} routeName 
     * @todo For now returning true, but as route maps are added the commented
     * code will be used to properly check user access on the route.
     * @returns boolen
     */
    hasRouteAccess(routeName) {
        let route = this.routeMaps.find(f => f.name === routeName);
        
        return this.allowedResources.includes(route.map);
    }
}
