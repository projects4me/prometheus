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
            map: 'App.Project.List'
        },
        {
            name: 'app.projects.create',
            map: 'App.Project.Create'
        },
        {
            name: 'app.projects.edit',
            map: 'App.Project.Edit'
        },
        {
            name: 'app.project.index',
            map: 'App.Project.Read'
        },
        {
            name: 'app.project.wiki.index',
            map: 'App.Project.Wiki.List'
        },
        {
            name: 'app.project.wiki.create',
            map: 'App.Project.Wiki.Create'
        },
        {
            name: 'app.project.wiki.page',
            map: 'App.Project.Wiki.Read'
        },
        {
            name: 'app.project.wiki.edit',
            map: 'App.Project.Wiki.Edit'
        },
        {
            name: 'app.project.conversation',
            map: 'App.Project.Conversation'
        },        
        {
            name: 'app.project.board',
            map: 'App.Project.Board'
        },
        {
            name: 'app.project.calendar',
            map: 'App.Project.Calendar'
        },
        {
            name: 'app.project.issue.index',
            map: 'App.Project.Issue.List'
        },
        {
            name: 'app.project.issue.create',
            map: 'App.Project.Issue.Create'
        },
        {
            name: 'app.project.issue.page',
            map: 'App.Project.Issue.Read'
        },
        {
            name: 'app.project.issue.edit',
            map: 'App.Project.Issue.Edit'
        },
        {
            name: 'app.user.page',
            map: 'App.User.Read'
        },
        {
            name: 'app.user.create',
            map: 'App.User.Create'
        },
        {
            name: 'app.user.index',
            map: 'App.User.List'
        },
        {
            name: 'app.user.edit',
            map: 'App.User.Edit'
        },
        {
            name: 'app.user.management',
            map: 'App.User.Management'
        },
        {
            name: 'app.admin.index',
            map: 'App.Admin.List'
        },
        {
            name: 'app.admin.create',
            map: 'App.Admin.Create'
        },
        {
            name: 'app.admin.page',
            map: 'App.Admin.Read'
        },
        {
            name: 'app.admin.edit',
            map: 'App.Admin.Edit'
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
     * This method check the user access on the given App.
     * 
     * @param {string} routeName 
     * @todo For now returning true, but as route maps are added the commented
     * code will be used to properly check user access on the App.
     * @returns boolen
     */
    hasRouteAccess(routeName) {
        let route = this.routeMaps.find(f => f.name === routeName);
        
        return this.allowedResources.includes(route.map);
    }
}
