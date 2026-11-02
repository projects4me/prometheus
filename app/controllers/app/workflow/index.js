/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import PrometheusListController from 'prometheus/controllers/prometheus/list';
import { triggerOf, actorsOf, scopeOf, runStatsOf } from 'prometheus/utils/workflow/list-summary';

/**
 * The controller of the workflows list.
 *
 * @class AppWorkflowIndexController
 * @namespace Prometheus.Controllers
 * @module App.Workflow
 * @extends PrometheusListController
 */
export default class AppWorkflowIndexController extends PrometheusListController {
    /**
     * The fields the query builder can filter the list by.
     *
     * @property metadata
     * @type Object
     */
    metadata = {
        filters: [
            {
                id: 'Workflow.name',
                label: this.intl.t('views.app.workflow.list.name'),
                type: 'string'
            },
            {
                id: 'Workflow.description',
                label: this.intl.t('views.app.workflow.list.description'),
                type: 'string',
                operators: ['equal', 'not_equal', 'contains', 'is_null', 'is_not_null']
            },
            {
                id: 'Workflow.status',
                label: this.intl.t('views.app.workflow.fields.status'),
                type: 'string',
                input: 'select',
                values: {
                    Draft: this.intl.t('views.app.workflow.status.Draft'),
                    Active: this.intl.t('views.app.workflow.status.Active'),
                    Disabled: this.intl.t('views.app.workflow.status.Disabled')
                },
                operators: ['equal', 'not_equal']
            }
        ]
    };

    sort = 'Workflow.name';
    order = 'asc';

    /**
     * The workflownode, workflowrun, agent and project records of the page.
     *
     * @property nodes
     * @type Array
     */
    nodes = [];
    runs = [];
    agents = [];
    projects = [];

    /**
     * The page's workflows with what the list shows: trigger, scope, actors and run figures.
     *
     * @property rows
     * @type Array
     */
    get rows() {
        let now = Date.now();
        return (this.model ? this.model.toArray() : []).map((workflow) => {
            let nodes = this.nodes.filter((node) => String(node.workflowId) === String(workflow.id));
            let runs = this.runs.filter((run) => String(run.workflowId) === String(workflow.id));

            return {
                workflow,
                trigger: triggerOf(nodes),
                projects: scopeOf(workflow.scope)
                    .map((id) => this.projects.find((project) => String(project.id) === id)?.name)
                    .filter(Boolean),
                actors: actorsOf(nodes).map((actor) => this._describeActor(actor)),
                runStats: runStatsOf(runs, now)
            };
        });
    }

    /**
     * Names an actor for display: an agent by its record, a placeholder by its role.
     *
     * @method _describeActor
     * @param {Object} actor an entry of actorsOf
     * @return {Object} `{ label, isAgent }`
     * @private
     */
    _describeActor(actor) {
        if (actor.id) {
            let agent = actor.type === 'agent' ? this.agents.find((record) => String(record.id) === actor.id) : null;
            return {
                label: agent?.name ?? this.intl.t('views.app.workflow.list.unknownActor'),
                isAgent: actor.type === 'agent'
            };
        }

        return {
            label: actor.sponsor ? this.intl.t('views.app.workflow.list.sponsorOf', { name: actor.role }) : actor.role,
            isAgent: false
        };
    }
}
