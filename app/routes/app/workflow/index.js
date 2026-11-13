/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { service } from '@ember/service';
import AppRoute from 'prometheus/routes/app';
import { scopeOf, actorsOf } from 'prometheus/utils/workflow/list-summary';

/**
 * This is the route for the list of workflows.
 *
 * @class AppWorkflowIndexRoute
 * @namespace Prometheus.Routes
 * @module App.Workflow
 * @extends AppRoute
 */
export default class AppWorkflowIndexRoute extends AppRoute {
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
     * Loads one page of workflows.
     *
     * @method model
     * @param {Object} params the query params
     * @return {Promise}
     */
    model(params) {
        let options = {
            query: params.query || null,
            sort: params.sort || 'Workflow.name',
            order: params.order || 'asc',
            page: params.page || 1,
            limit: 20
        };

        return this.store.query('workflow', options).catch((error) => {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        });
    }

    /**
     * Loads what the rows show besides the workflow: the nodes (trigger and actors), the runs, the agents and
     * projects they name and the current user's saved searches. The children are queried for the whole page
     * at once, not through `rels`.
     *
     * @method afterModel
     * @param {Array} workflows the workflows of the page
     * @return {Promise}
     */
    async afterModel(workflows) {
        let list = workflows ? workflows.slice() : [];
        let userId = this.currentUser.user.id;
        this.nodes = [];
        this.runs = [];
        this.agents = [];
        this.projects = [];
        this.savedsearches = [];
        this.schema = null;

        try {
            let savedsearches = await this.store.query('savedsearch', {
                query: `((Savedsearch.relatedTo : workflow) AND (Savedsearch.createdUser : ${userId}))`,
                limit: -1
            });
            this.savedsearches = savedsearches.slice();
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }

        try {
            let schema = await this.querySchemaService.load('Workflow');
            this.schema = Array.isArray(schema) ? null : schema;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }

        try {
            if (!list.length) {
                return;
            }

            let anyOf = (type, field, values) => `(${[...values].map((value) => `(${type}.${field} : ${value})`).join(' OR ')})`;
            let ids = list.map((workflow) => workflow.id);
            this.nodes = (await this.store.query('workflownode', { query: anyOf('Workflownode', 'workflowId', ids), limit: -1 })).slice();
            this.runs = (await this.store.query('workflowrun', {
                query: anyOf('Workflowrun', 'workflowId', ids),
                sort: 'Workflowrun.dateCreated',
                order: 'DESC',
                limit: -1
            })).slice();

            let agentIds = new Set(actorsOf(this.nodes).filter((actor) => actor.type === 'agent' && actor.id).map((actor) => actor.id));
            let projectIds = new Set(list.flatMap((workflow) => scopeOf(workflow.scope)));

            if (agentIds.size) {
                this.agents = (await this.store.query('agent', { query: anyOf('Agent', 'id', agentIds), limit: -1 })).slice();
            }
            if (projectIds.size) {
                this.projects = (await this.store.query('project', { query: anyOf('Project', 'id', projectIds), limit: -1 })).slice();
            }
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }
    }

    /**
     * Hands the page's data to the controller.
     *
     * @method setupController
     * @param {Prometheus.Controllers.App.Workflow.Index} controller the controller of this route
     * @param {Array} model the workflows
     */
    setupController(controller, model) {
        controller.set('model', model);
        controller.set('nodes', this.nodes);
        controller.set('runs', this.runs);
        controller.set('agents', this.agents);
        controller.set('projects', this.projects);
        controller.set('savedsearches', this.savedsearches);
        controller.set('querySchema', this.schema);

        if (controller.searchId) {
            controller.set('activeSearch', this.savedsearches.find((search) => search.id === controller.searchId) || null);
        }
    }
}
