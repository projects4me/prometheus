/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';
import { hashSettled } from 'rsvp';

/**
 * The ideas route, it loads the ideas of the selected project for the idea browser
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
     * A new query reloads the ideas; the saved search id only marks the picked search.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        query: { refreshModel: true },
        searchId: { refreshModel: false }
    };

    /**
     * Loads the ideas of the selected project, the newest updated first, narrowed by the query when there is one.
     *
     * @method model
     * @param {Object} params The query params
     * @returns {Promise}
     */
    async model(params) {
        Logger.debug('AppProjectIdeaRoute::model');
        return this.loadIdeas(params?.query);
    }

    /**
     * Loads the ezSearch schema and the saved searches of the ideas once per visit; a failure only drops the search.
     *
     * @method afterModel
     * @returns {Promise}
     */
    async afterModel() {
        if (this.searchData) {
            return;
        }
        let projectId = this.trackedProject.getProjectId();
        let results = await hashSettled({
            schema: this.querySchema.load('Idea', { projectId }),
            savedsearches: this.savedSearch.load('idea', projectId)
        });
        if (results.schema.state === 'rejected') {
            this.errorManager.handleError(results.schema.reason, { moduleName: 'idea' });
        }
        this.searchData = {
            schema: results.schema.state === 'fulfilled' ? results.schema.value : null,
            savedsearches: results.savedsearches.state === 'fulfilled' ? results.savedsearches.value : []
        };
    }

    /**
     * Queries the ideas of the selected project, the newest updated first.
     *
     * @method loadIdeas
     * @param {String} [query] A Gaia query the ideas must match as well
     * @returns {Promise}
     * @public
     */
    async loadIdeas(query) {
        let projectId = this.trackedProject.getProjectId();
        let scope = `(Idea.projectId : ${projectId})`;
        try {
            return await this.store.query('idea', {
                query: query ? `(${scope} AND (${query}))` : scope,
                sort: 'Idea.dateModified',
                order: 'DESC',
                limit: -1
            });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Counts all the ideas of the selected project, whatever the search; null when it cannot be counted.
     *
     * @method loadTotal
     * @returns {Promise<Number|null>}
     * @public
     */
    async loadTotal() {
        try {
            let ideas = await this.loadIdeas();
            return ideas ? ideas.length : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Queries the plans of the given ideas in one request.
     *
     * @method loadPlans
     * @param {Array} ideaIds
     * @returns {Promise}
     * @public
     */
    async loadPlans(ideaIds) {
        if (!ideaIds.length) {
            return [];
        }
        let conditions = ideaIds.map(id => `(Ideaplan.ideaId : ${id})`).join(' OR ');
        try {
            return await this.store.query('ideaplan', { query: `(${conditions})`, limit: -1 });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
            return null;
        }
    }

    /**
     * Hands the ideas to the controller.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Array} model
     * @private
     */
    setupController(controller, model) {
        controller.ideas = model ? model.toArray() : [];
        controller.querySchema = this.searchData?.schema ?? null;
        controller.savedsearches = this.searchData?.savedsearches ?? [];
        controller.newSavedsearch = controller.newSavedsearch || this.store.createRecord('savedsearch');
        controller.totalIdeas = controller.query ? null : controller.ideas.length;
        if (controller.query) {
            this.loadTotal().then(total => {
                controller.totalIdeas = total;
            });
        }
        controller.planStatuses = {};
        controller.loadedIdeaIds = new Set();
        controller.loadPlanStatuses(controller.ideas, ids => this.loadPlans(ids));
        controller.registerHermesIntents(this.trackedProject.getProjectId(), () => this.loadIdeas(controller.query), ids => this.loadPlans(ids), () => this.loadTotal());
    }

    /**
     * Disposes the Hermes registration when leaving the ideas
     *
     * @method resetController
     * @param {Controller} controller
     * @param {Boolean} isExiting
     * @private
     */
    resetController(controller, isExiting) {
        if (isExiting) {
            controller.view = null;
            controller.query = null;
            controller.searchId = null;
            this.searchData = null;
            controller.unregisterHermesIntents();
        }
    }
}
