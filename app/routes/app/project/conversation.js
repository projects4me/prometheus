/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { service } from '@ember/service';
import { hash, hashSettled } from 'rsvp';
import UrlState from 'prometheus/utils/state/url-state';
import { BROWSER_PARAMS, browserValues } from 'prometheus/utils/conversation/browser-defaults';

/**
 * The threads layout route: it loads the first page of the thread list and the milestones the list is grouped by;
 * later pages, sorts, groups and searches reload only the list through the controller's UrlState and ListLoader.
 * The index and page children fill the detail column.
 *
 * @class Conversation
 * @namespace Prometheus.Routes
 * @module App.Project
 * @extends App
 */
export default class AppProjectConversationRoute extends App {
    /**
     * The requested module
     *
     * @property module
     * @type String
     * @public
     */
    module = 'conversationroom';

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
     * `c_id` is the old link to a thread, the index route turns it into the thread's page.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        ...UrlState.queryParamsConfig(BROWSER_PARAMS),
        searchId: { refreshModel: false },
        c_id: { refreshModel: false }
    };

    /**
     * Loads the first page of the threads for the query params with the controller's request
     *
     * @method model
     * @param {Object} params The query params
     * @returns {Promise<Object>} The params and the first page (`{ records }` or `{ error }`); afterModel adds the
     *   milestone names
     */
    async model(params) {
        Logger.debug('AppProjectConversationRoute::model');
        let controller = this.controllerFor('app.project.conversation');
        let values = browserValues(params);
        return hash({
            values,
            firstPage: this.loadFirstPage(controller, values)
        });
    }

    /**
     * Loads the ezSearch schema, the saved searches and the milestones of the threads once per visit and project; a
     * failure only drops the search or the milestone names.
     *
     * @method afterModel
     * @param {Object} model The params and the first page
     * @returns {Promise}
     */
    async afterModel(model) {
        let projectId = this.trackedProject.getProjectId();
        if (!this.sideData || this.sideData.projectId !== projectId) {
            await this.loadSideData(projectId);
        }
        model.milestones = this.sideData.milestones;
    }

    /**
     * Loads the ezSearch schema, the saved searches and the milestones of the project
     *
     * @method loadSideData
     * @param {String} projectId
     * @returns {Promise}
     * @private
     */
    async loadSideData(projectId) {
        let results = await hashSettled({
            schema: this.querySchema.load('Conversationroom', { projectId }),
            savedsearches: this.savedSearch.load('conversationroom', projectId),
            milestones: this.store.query('milestone', {
                query: `(Milestone.projectId : ${projectId})`,
                limit: -1
            })
        });
        if (results.schema.state === 'rejected') {
            this.errorManager.handleError(results.schema.reason, { moduleName: 'conversationroom' });
        }
        let milestones = {};
        if (results.milestones.state === 'fulfilled') {
            results.milestones.value.forEach(milestone => {
                milestones[milestone.id] = milestone.name;
            });
        }
        this.sideData = {
            projectId,
            schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
            savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : [],
            milestones
        };
    }

    /**
     * Queries the first page of the threads with the controller's list request; a failure is handed to the
     * controller, whose list shows the error and a retry instead of the whole page failing
     *
     * @method loadFirstPage
     * @param {Controller} controller
     * @param {Object} values The browser params
     * @returns {Promise<Object>} `{ records }` or `{ error }`
     * @public
     */
    async loadFirstPage(controller, values) {
        try {
            return { records: await this.store.query('conversationroom', controller.conversationList.request(values)) };
        } catch (error) {
            return { error };
        }
    }

    /**
     * Hands the search data, the milestones and the first page to the controller and registers the live updates
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model The params and the first page
     * @private
     */
    setupController(controller, model) {
        Logger.debug('AppProjectConversationRoute::setupController');
        controller.querySchema = this.sideData?.schema ?? null;
        controller.savedsearches = this.sideData?.savedsearches ?? [];
        controller.milestones = model?.milestones ?? {};
        controller.newSavedsearch = controller.newSavedsearch || this.store.createRecord('savedsearch');
        controller.newConversation = this.store.createRecord('conversationroom', {
            projectShortcode: this.trackedProject.shortCode
        });
        controller.module = this.module;
        controller.projectId = this.trackedProject.getProjectId();
        controller.projectShortcode = this.trackedProject.shortCode;
        controller.showFirstPage(model?.values, model?.firstPage);
        controller.registerHermesIntents(this.trackedProject.getProjectId());
    }

    /**
     * Puts the browser back to its defaults when the threads are left or the project switches
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        controller.resetBrowser();
        if (isExiting) {
            this.sideData = null;
        }
    }
}
