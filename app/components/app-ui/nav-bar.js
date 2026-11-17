/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import MD from "../../utils/metadata/metadata";
import ENV from "prometheus/config/environment";
import { action } from '@ember/object';
import Logger from "js-logger";
import { tracked } from '@glimmer/tracking';
import AppComponent from '../app';
import { service } from '@ember/service';

/**
 * This component is used to render the navbar
 *
 * @class NavBar
 * @namespace Prometheus.Components
 * @extends AppComponent
 * @author Hammad Hassan <gollomer@gmail.com>
 */
export default class NavBarComponent extends AppComponent {

    /**
     * The projectId property is used in order to track it when project id get updated
     *
     * @property projectId
     * @type String
     * @for NavBar
     * @protected
     */
    @tracked projectId;

    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @for NavBar
     * @private
     */
    @service trackedProject;

    /**
     * The acl service decides which admin entries the user may see.
     *
     * @property acl
     * @type Ember.Service
     * @for NavBar
     * @private
     */
    @service acl;

    /**
     * The router service is used to close the sidebar on phones after navigation.
     *
     * @property router
     * @type Ember.Service
     * @for NavBar
     * @private
     */
    @service router;

    /**
     * This function fetches the navigation metaData and makes it available for display
     *
     * @method constructor
     * @public
     */
    constructor() {
        Logger.debug('NavBarComponent::init()');
        super(...arguments);
        this.appPrefix = ENV.api.prefix;
        this.projectId = this.trackedProject.getProjectId();
    }

    /**
     * This function is used in order to handle navigation to our desired route
     *
     * @method navigate
     * @param {String} route
     * @param {Object} routeParams
     * @param {Boolean} projectRelated
     * @param {String} shortCode
     * @public
     */
    @action navigate(route, projectRelated, shortCode) {
        Logger.debug('A transition requested to route ' + route);
        let routeParams = {};
        if (projectRelated === true) {
            routeParams['shortcode'] = shortCode;
        }
        if (Object.keys(routeParams).length > 0) {
            this.router.transitionTo(route, routeParams);
        }
        else {
            this.router.transitionTo(route);
        }
    }

    /**
     * This property contains the metadata for navigation. It first get the metadata, drops the entries the user
     * has no access to and then sorts it by order.
     * 
     * @property navigationMeta
     * @for NavBar
     */
    get navigationMeta() {
        let navigationMeta = MD.create().getViewMeta('Navigation', 'items');
        let sortedNavigationMeta = Object.entries(navigationMeta)
        .filter(([, item]) => this.acl.checkAccess(item.aclContext))
        .sort((a, b) => a[1].order - b[1].order)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

        return sortedNavigationMeta;
    }

    /**
     * The navigation items that work across projects (projectRelated is not set).
     *
     * @property workspaceNavigationMeta
     * @for NavBar
     */
    get workspaceNavigationMeta() {
        return this._filterByProjectRelated(false);
    }

    /**
     * The navigation items that belong to the selected project (projectRelated is set).
     *
     * @property projectNavigationMeta
     * @for NavBar
     */
    get projectNavigationMeta() {
        return this._filterByProjectRelated(true);
    }

    /**
     * Keeps the order of navigationMeta and returns only the items on one side of projectRelated.
     *
     * @method _filterByProjectRelated
     * @param {Boolean} projectRelated
     * @return {Object}
     * @private
     */
    _filterByProjectRelated(projectRelated) {
        return Object.fromEntries(
            Object.entries(this.navigationMeta).filter(([, item]) => Boolean(item.projectRelated) === projectRelated)
        );
    }
    /**
     * This property contains the metadata for admin navigation.
     * 
     * @property adminNavigationMeta
     * @for NavBar
     */
    get adminNavigationMeta() {
        let adminItems = MD.create().getViewMeta('Navigation', 'adminItems');
        return Object.fromEntries(
            Object.entries(adminItems).filter(([, item]) => this.acl.checkAccess(item.aclContext))
        );
    }
}
