/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { service } from '@ember/service';
import { hash, hashSettled } from 'rsvp';
import UrlState from 'prometheus/utils/state/url-state';
import { BROWSER_PARAMS, browserValues } from 'prometheus/utils/idea/browser-defaults';

/**
 * The ideas route, it loads the first page of the idea browser; later pages, sorts, groups and searches reload only
 * the list through the controller's UrlState and ListLoader
 *
 * @class Idea
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends App
 */
export default class AppProjectIdeaRoute extends App {
    /**
     * The trackedProject service provides id of the selected project.
     *
     * @property trackedProject
     * @type Ember.Service
     * @public
     */
    @service trackedProject;

    /**
     * The ezSearch schema builder.
     *
     * @property querySchema
     * @type Ember.Service
     * @public
     */
    @service('query-schema') querySchema;

    /**
     * The saved searches service.
     *
     * @property savedSearch
     * @type Ember.Service
     * @public
     */
    @service('saved-search') savedSearch;

    /**
     * No query param refreshes the route: the controller reloads only the list when one changes the list request.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        ...UrlState.queryParamsConfig(BROWSER_PARAMS),
        searchId: { refreshModel: false }
    };

    /**
     * Loads the first page of the ideas for the query params, with the controller's request, and the archived count
     * for the footer toggle
     *
     * @method model
     * @param {Object} params The query params
     * @returns {Promise<Object>} The params, the first page (`{ records }` or `{ error }`) and the archived count
     */
    async model(params) {
        Logger.debug('AppProjectIdeaRoute::model');
        let controller = this.controllerFor('app.project.idea');
        let values = browserValues(params);
        return hash({
            values,
            firstPage: this.loadFirstPage(controller, values),
            archivedTotal: controller.countArchived()
        });
    }

    /**
     * Loads the ezSearch schema and the saved searches of the ideas once per visit and project; a failure only drops
     * the search.
     *
     * @method afterModel
     * @returns {Promise}
     */
    async afterModel() {
        let projectId = this.trackedProject.getProjectId();
        if (this.searchData && this.searchData.projectId === projectId) {
            return;
        }
        let results = await hashSettled({
            schema: this.querySchema.load('Idea', { projectId }),
            savedsearches: this.savedSearch.load('idea', projectId)
        });
        if (results.schema.state === 'rejected') {
            this.errorManager.handleError(results.schema.reason, { moduleName: 'idea' });
        }
        this.searchData = {
            projectId,
            schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
            savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : []
        };
    }

    /**
     * Queries the first page of the ideas with the controller's list request; a failure is handed to the controller,
     * whose list shows the error and a retry instead of the whole page failing
     *
     * @method loadFirstPage
     * @param {Controller} controller
     * @param {Object} values The browser params
     * @returns {Promise<Object>} `{ records }` or `{ error }`
     * @public
     */
    async loadFirstPage(controller, values) {
        try {
            return { records: await this.store.query('idea', controller.ideaList.request(values)) };
        } catch (error) {
            return { error };
        }
    }

    /**
     * Hands the search data and the first page to the controller and registers the live updates
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model The params, first page and archived count
     * @private
     */
    setupController(controller, model) {
        controller.querySchema = this.searchData?.schema ?? null;
        controller.savedsearches = this.searchData?.savedsearches ?? [];
        controller.newSavedsearch = controller.newSavedsearch || this.store.createRecord('savedsearch');
        controller.showFirstPage(model?.values, model?.firstPage, model?.archivedTotal);
        controller.registerHermesIntents(this.trackedProject.getProjectId());
    }

    /**
     * Puts the browser back to its defaults when the idea area is left or the project switches
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        controller.resetBrowser();
        if (isExiting) {
            this.searchData = null;
        }
    }
}
