/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import MD from "../../utils/metadata/metadata";
import ENV from "prometheus/config/environment";
import { action } from '@ember/object';
import Logger from "js-logger";
import { tracked } from '@glimmer/tracking';
import AppComponent from '../app';
import { inject as service } from '@ember/service';

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
     * This function returns list of projects
     *
     * @method get
     * @public
     */
    get projectsList() {
        return this.args.projectsList ?? '';
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
     * This function is called when a project is selected
     *
     * @method projectChanged
     * @param {String} projectId The selected project
     * @public
     */
    @action projectChanged(project) {
        this.projectId = project.value;
        this.trackedProject.setProjectId(project.value);
        let selectedProject = this.trackedProject.getProject();
        let lastSelectedProject = this.trackedProject.lastSelectedProject;
        if(selectedProject.shortCode !== undefined){
            let url = this.getTransitionUrl(selectedProject, lastSelectedProject);
            this.router.transitionTo(url);
        }
    }

    /**
     * This function is used to get the url when a project is changed
     *
     * @method getTransitionUrl
     * @param {Object} selectedProject The selected project
     * @param {Object} lastSelectedProject The last selected project
     * @return {String} The url to transition to
     */
    getTransitionUrl(selectedProject, lastSelectedProject) {
        let notAllowedTransitions = ['app.project.index', 'app.project.issue.page', 'app.project.wiki.page'];
        if(notAllowedTransitions.includes(this.router.currentRouteName)){
            return `/app/project/${selectedProject.shortCode.toLowerCase()}`;
        }
        let currentUrl = this.router.currentURL;
        if(lastSelectedProject && currentUrl.includes(lastSelectedProject.shortCode.toLowerCase())){
            let url = currentUrl.replace(lastSelectedProject.shortCode.toLowerCase(), selectedProject.shortCode.toLowerCase());
            if(url.includes('?')){
                url = url.split('?')[0];
            }
            return url;
        } else {
            return `/app/project/${selectedProject.shortCode.toLowerCase()}`;
        }
    }

    /**
     * This property contains the metadata for navigation. It first get the metadata and then sorts it by order.
     * 
     * @property navigationMeta
     * @for NavBar
     */
    get navigationMeta() {
        let navigationMeta = MD.create().getViewMeta('Navigation', 'items');
        let sortedNavigationMeta = Object.entries(navigationMeta)
        .sort((a, b) => a[1].order - b[1].order)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

        return sortedNavigationMeta;
    }
    /**
     * This property contains the metadata for admin navigation.
     * 
     * @property adminNavigationMeta
     * @for NavBar
     */
    get adminNavigationMeta() {
        return MD.create().getViewMeta('Navigation', 'adminItems');
    }
}
