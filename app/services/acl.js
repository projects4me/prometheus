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
        },
        {
            name: 'app.role.index',
            map: 'App.Role.List'
        },
        {
            name: 'app.role.page',
            map: 'App.Role.Page'
        }
    ];

    /**
     * The list of routes on which acl is not required.
     * 
     * @property explicitRoutes
     * @type array
     * @public
     */
    explicitRoutes = [
        'signin.index'
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
     * This method check the user access on the given Route.
     * 
     * @param {string} routeName 
     * @returns boolen
     */
    hasRouteAccess(routeName) {
        let route = null,
            hasAccess = null;

        route = this.explicitRoutes.find(route => route === routeName)
        if (!route) {
            route = this.routeMaps.find(f => f.name === routeName);
            hasAccess = this.checkAccess(route?.map);
        } else if (route) {
            hasAccess = true;
        }

        return hasAccess;
    }

    /**
     * This function is used to user access on the given resource.
     * 
     * @param {string} resource
     * @returns boolean
     */
    checkAccess(resource) {
        let hasAccess = this.allowedResources.includes(resource);
        return (!hasAccess && resource !== undefined) ? this.checkParentAccess(resource) : hasAccess;
    }

    /**
     * If the user doesn't have access then this function will iteratively check the resource's 
     * parent access also and if user will have access on its parent resource then
     * access will be given to user on the specific resource.
     * 
     * @param {string} childResource 
     * @returns boolean
     */
    checkParentAccess(childResource) {
        let resources = childResource.includes('.') ? childResource.split('.') : childResource.split('');
        let hasAccess = false;

        while (resources.length > 1) {
            resources.pop();
            let parentResource = (resources.length !== 1) ? resources.join('.') : resources.join('');
            if (this.allowedResources.includes(parentResource)) {
                hasAccess = true;
                break;
            }
        }

        return hasAccess;
    }
}
