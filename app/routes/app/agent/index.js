/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { inject as service } from '@ember/service';
import AppRoute from 'prometheus/routes/app';

/**
 * This is the route for the list of agents.
 *
 * @class AppAgentIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Agent
 * @extends AppRoute
 */
export default class AppAgentIndexRoute extends AppRoute {
    /**
     * Loads the search schema of the module.
     *
     * @property querySchemaService
     * @type Prometheus.Services.QuerySchema
     */
    @service('query-schema') querySchemaService;

    /**
     * The list is reloaded whenever one of these query params changes.
     *
     * @property queryParams
     * @type Object
     */
    queryParams = {
        query: { refreshModel: true },
        page: { refreshModel: true },
        sort: { refreshModel: true },
        order: { refreshModel: true }
    };

    /**
     * Loads one page of agents with their user and sponsor.
     *
     * @method model
     * @param {Object} params the query params
     * @return {Promise}
     */
    model(params) {
        let options = {
            query: params.query || null,
            rels: 'user,sponsor',
            sort: params.sort || 'Agent.name',
            order: params.order || 'asc',
            page: params.page || 1,
            limit: 20
        };

        return this.store.query('agent', options).catch((error) => {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        });
    }

    /**
     * Loads the project memberships of the agents on the page and the current user's saved searches.
     *
     * @method afterModel
     * @param {Array} agents the agents of the page
     * @return {Promise}
     */
    async afterModel(agents) {
        let userIds = (agents ? agents.slice() : []).map((agent) => agent.userId).filter(Boolean);
        let userId = this.currentUser.user.id;
        this.memberships = [];
        this.savedsearches = [];
        this.schema = null;

        try {
            let savedsearches = await this.store.query('savedsearch', {
                query: `((Savedsearch.relatedTo : agent) AND (Savedsearch.createdUser : ${userId}))`,
                limit: -1
            });
            this.savedsearches = savedsearches.slice();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }

        try {
            let schema = await this.querySchemaService.load('Agent');
            this.schema = Array.isArray(schema) ? null : schema;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }

        try {
            if (userIds.length) {
                let query = userIds.map((id) => `(Membership.userId : ${id})`).join(' OR ');
                let memberships = await this.store.query('membership', {
                    query: `(${query})`,
                    rels: 'project',
                    limit: -1
                });
                this.memberships = memberships.slice();
            }
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'agent' });
        }
    }

    /**
     * Hands the page's data to the controller.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Agent.Index} controller the controller of this route
     * @param {Array} model the agents
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('memberships', this.memberships);
        controller.set('savedsearches', this.savedsearches);
        controller.set('querySchema', this.schema);

        if (controller.searchId) {
            controller.set('activeSearch', this.savedsearches.find((search) => search.id === controller.searchId) || null);
        }
    }
}
