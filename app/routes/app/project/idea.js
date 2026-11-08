/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import App from 'prometheus/routes/app';
import { inject as service } from '@ember/service';
import { hash, hashSettled } from 'rsvp';

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
     * A new query, page or sort reloads the ideas; the saved search id only marks the picked search.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        query: { refreshModel: true },
        searchId: { refreshModel: false },
        page: { refreshModel: true },
        sort: { refreshModel: true },
        order: { refreshModel: true },
        group: { refreshModel: true },
        archived: { refreshModel: true }
    };

    /**
     * Loads a page of the ideas of the selected project and the counts the browser shows, for the query params
     * and the page size and archived toggle of the controller.
     *
     * @method model
     * @param {Object} params The query params
     * @returns {Promise<Object>} The ideas and the counts
     */
    async model(params) {
        Logger.debug('AppProjectIdeaRoute::model');
        let controller = this.controllerFor('app.project.idea');
        let options = {
            query: params?.query || null,
            page: params?.page ?? controller.page,
            sort: params?.sort ?? controller.sort,
            order: params?.order ?? controller.order,
            group: params?.group ?? controller.group,
            limit: controller.pageSize,
            showArchived: params?.archived ?? controller.archived
        };
        return hash({
            ideas: this.loadIdeas(options),
            counts: this.loadCounts(options)
        });
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
     * The Gaia query of the listed ideas: the ideas of the selected project, only the open ones unless the archived
     * ones are shown or a search runs (a search matches every status), narrowed by the search.
     *
     * @method buildIdeaQuery
     * @param {Object} options
     * @param {String} [options.query] A Gaia query the ideas must match as well
     * @param {Boolean} [options.showArchived] Whether the archived ideas are listed too
     * @returns {String}
     * @public
     */
    buildIdeaQuery({ query, showArchived } = {}) {
        let conditions = [`(Idea.projectId : ${this.trackedProject.getProjectId()})`];
        if (!showArchived && !query) {
            conditions.push('(Idea.status : open)');
        }
        if (query) {
            conditions.push(`(${query})`);
        }
        return conditions.length > 1 ? `(${conditions.join(' AND ')})` : conditions[0];
    }

    /**
     * The sort of the list: grouping by creator sorts by the creator first, so the groups continue across pages.
     *
     * @method buildSort
     * @param {Object} options
     * @param {String} [options.sort] The chosen sort field
     * @param {String} [options.group] The grouping of the list
     * @returns {String}
     * @public
     */
    buildSort({ sort, group } = {}) {
        let field = sort || 'Idea.dateModified';
        return group === 'createdBy' ? `Idea.createdUser,${field}` : field;
    }

    /**
     * Queries a page of the ideas with their creator, the only relation the browser needs.
     *
     * @method loadIdeas
     * @param {Object} options The query, page, sort, order, limit and showArchived of the list
     * @returns {Promise} The ideas, their meta holds the total when Gaia sends it
     * @public
     */
    async loadIdeas(options = {}) {
        try {
            return await this.store.query('idea', {
                query: this.buildIdeaQuery(options),
                rels: 'createdBy',
                sort: this.buildSort(options),
                order: options.order || 'DESC',
                limit: options.limit ?? -1,
                page: options.page || 1
            });
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'idea' });
        }
    }

    /**
     * Counts the ideas of the project matching a condition; null when they cannot be counted.
     * Gaia does not send a total in the list meta yet, so the matching ideas are loaded without relations and
     * counted; once it does, meta.total is used.
     *
     * @method countIdeas
     * @param {String} [condition] A Gaia condition the ideas must match as well
     * @returns {Promise<Number|null>}
     * @public
     */
    async countIdeas(condition) {
        let scope = `(Idea.projectId : ${this.trackedProject.getProjectId()})`;
        try {
            let ideas = await this.store.query('idea', {
                query: condition ? `(${scope} AND ${condition})` : scope,
                rels: 'none',
                limit: -1
            });
            return ideas?.meta?.total ?? ideas?.length ?? null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Counts what the browser shows besides the list: the archived ideas for the footer toggle, and all the ideas
     * of the project while a search narrows the list.
     *
     * @method loadCounts
     * @param {Object} options The query of the list
     * @returns {Promise<Object>} archived and project counts, null where not needed or not known
     * @public
     */
    async loadCounts(options = {}) {
        if (options.query) {
            return { archived: null, project: await this.countIdeas() };
        }
        return { archived: await this.countIdeas('(Idea.status : archived)'), project: null };
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
     * Hands the ideas and counts to the controller and registers the live updates, which re-run the list query.
     *
     * @method setupController
     * @param {Controller} controller
     * @param {Object} model The ideas and counts
     * @private
     */
    setupController(controller, model) {
        controller.querySchema = this.searchData?.schema ?? null;
        controller.savedsearches = this.searchData?.savedsearches ?? [];
        controller.newSavedsearch = controller.newSavedsearch || this.store.createRecord('savedsearch');
        controller.planStatuses = {};
        controller.loadedIdeaIds = new Set();
        controller.showIdeas(model?.ideas, model?.counts);
        controller.loadPlanStatuses(controller.ideas, ids => this.loadPlans(ids));
        controller.registerHermesIntents(
            this.trackedProject.getProjectId(),
            options => this.loadIdeas(options),
            ids => this.loadPlans(ids),
            options => this.loadCounts(options)
        );
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
            controller.page = 1;
            controller.group = 'none';
            controller.archived = false;
            this.searchData = null;
            controller.unregisterHermesIntents();
        }
    }
}
