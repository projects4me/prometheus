/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import MD from "../../utils/metadata/metadata";
import ENV from "prometheus/config/environment";
import { action } from '@ember/object';
import Logger from "js-logger";
import { tracked } from '@glimmer/tracking';
import AppComponent from '../app';

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
     * @private
     */
    @tracked projectId;

    /**
     * This function fetches the navigation metaData and makes it available for display
     *
     * @method constructor
     * @public
     */
    constructor() {
        Logger.debug('NavBarComponent::init()');
        super(...arguments);
        this.metaData = MD.create().getViewMeta('Navigation', 'items');
        Logger.debug(this.metaData);
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
     * @param {String} anchorRoute
     * @param {String} projectId
     * @public
     */
    @action navigate(route, routeParams, anchorRoute, projectId) {
        Logger.debug('A transition requested to route ' + route);
        if (projectId !== undefined) {
            if (routeParams === null) {
                routeParams = {};
            }
            routeParams['project_id'] = projectId;
        }
        if (routeParams !== undefined && routeParams !== null && routeParams !== '') {
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
        if (project.value !== undefined && project.value !== null && project.value !== '') {
            this.router.transitionTo('app.project', { project_id: project.value });
        }
    }
}
