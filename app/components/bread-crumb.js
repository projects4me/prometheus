/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

/**
 * Breadcrumb component that automatically builds breadcrumb trail
 * 
 * @class BreadCrumb
 * @namespace Prometheus.Components
 * @extends Component
 * @author Rana Nouman <ranamnouman@gmail.com>
 */
export default class BreadCrumbComponent extends Component {
    /**
     * Router service for route information
     * 
     * @property router
     * @type Ember.Service
     * @public
     */
    @service router;

    /**
     * Tracked project service for project context
     * 
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service breadcrumb;

    /**
     * Property that builds breadcrumb trail
     * 
     * @property items
     * @type Array
     * @public
     */
    get items() {
        const currentRoute = this.router.currentRouteName;
        if (!currentRoute) {
            return [];
        }

        const trail = [];
        const visited = new Set();
        
        // Get current route metadata and merge with component arguments
        let route = currentRoute;
        
        while (route && !visited.has(route)) {
            visited.add(route);
            
            const meta = this.breadcrumb.getBreadcrumb(route);
            
            if (meta) {
                let itemConfig = { ...meta };
                const breadcrumbItem = this.breadcrumb.createBreadcrumbItem(route, itemConfig);
                if (breadcrumbItem) {
                    trail.unshift(breadcrumbItem);
                }
                
                // Move to parent route
                route = meta.parent || this.inferParentRoute(route);
            } else {
                // If no metadata, try to infer parent from route name
                route = this.inferParentRoute(route);
            }
        }
        
        // Always ensure 'app' (Dashboard) is first if we're in app routes
        if (currentRoute.startsWith('app.') && !trail.some(item => item.route === 'app')) {
            const appMeta = this.breadcrumb.getBreadcrumb('app');
            if (appMeta) {
                const appItem = this.breadcrumb.createBreadcrumbItem('app', appMeta);
                if (appItem) {
                    trail.unshift(appItem);
                }
            }
        }
        
        return trail;
    }   

    /**
     * Get items with isLast flag computed
     * 
     * @property itemsWithLastFlag
     * @type Array
     * @public
     */
    get itemsWithLastFlag() {
        const items = this.items;
        return items.map((item, index) => {
            return {
                ...item,
                isLast: index === items.length - 1
            };
        });
    }

    /**
     * Infer parent route from route name
     * 
     * @method inferParentRoute
     * @param {String} routeName - Route name
     * @returns {String|null} Parent route name or null
     * @private
     */
    inferParentRoute(routeName) {
        const parts = routeName.split('.');
        if (parts.length > 1) {
            parts.pop();
            return parts.join('.');
        }
        return null;
    }
}

