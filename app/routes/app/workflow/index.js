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
     * Batches the list's extra queries into bulk requests.
     *
     * @property bulk
     * @type Prometheus.Services.BulkService
     */
    @service bulk;

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
            let schema = await this.querySchemaService.load('Workflow');
            this.schema = Array.isArray(schema) ? null : schema;
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
        }

        let anyOf = (type, field, values) => `(${[...values].map((value) => `(${type}.${field} : ${value})`).join(' OR ')})`;
        let ids = list.map((workflow) => workflow.id);
        // a failed item leaves its list empty
        let recordsOf = (result) => {
            if (!result || result.error) {
                if (result?.error) {
                    this.errorManager.handleError(result.error, { moduleName: 'workflow' });
                }
                return [];
            }
            return result.records.slice();
        };

        // Round 1: saved searches, nodes and runs
        let items = [{
            id: 'savedsearches',
            modelName: 'savedsearch',
            query: {
                query: `((Savedsearch.relatedTo : workflow) AND (Savedsearch.createdUser : ${userId}))`,
                limit: -1
            }
        }];
        if (list.length) {
            items.push(
                { id: 'nodes', modelName: 'workflownode', query: { query: anyOf('Workflownode', 'workflowId', ids), limit: -1 } },
                {
                    id: 'runs',
                    modelName: 'workflowrun',
                    query: { query: anyOf('Workflowrun', 'workflowId', ids), sort: 'Workflowrun.dateCreated', order: 'DESC', limit: -1 }
                }
            );
        }

        try {
            let first = await this.bulk.query(items);
            this.savedsearches = recordsOf(first.savedsearches);
            this.nodes = recordsOf(first.nodes);
            this.runs = recordsOf(first.runs);
        } catch (error) {
            this.errorManager.handleError(error, { moduleName: 'workflow' });
            return;
        }

        // Round 2: the agents and projects the first round and the list name
        let agentIds = new Set(actorsOf(this.nodes).filter((actor) => actor.type === 'agent' && actor.id).map((actor) => actor.id));
        let projectIds = new Set(list.flatMap((workflow) => scopeOf(workflow.scope)));
        let second = [];
        if (agentIds.size) {
            second.push({ id: 'agents', modelName: 'agent', query: { query: anyOf('Agent', 'id', agentIds), limit: -1 } });
        }
        if (projectIds.size) {
            second.push({ id: 'projects', modelName: 'project', query: { query: anyOf('Project', 'id', projectIds), limit: -1 } });
        }

        if (second.length) {
            try {
                let results = await this.bulk.query(second);
                this.agents = recordsOf(results.agents);
                this.projects = recordsOf(results.projects);
            } catch (error) {
                this.errorManager.handleError(error, { moduleName: 'workflow' });
            }
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
