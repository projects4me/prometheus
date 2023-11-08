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
            name: 'app.index',
            map: 'App'
        },
        {
            name: 'app.project.board',
            map: 'App.Project.Board'
        },
        {
            name: 'app.access-denied',
            map: 'App.AccessDenied'
        }
    ]

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
        
        // return this.allowedResources.includes(route.map);
        return true;
    }
}
