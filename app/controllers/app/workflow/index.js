/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
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
     * The search schema <EzSearch> filters the list with.
     *
     * @property querySchema
     * @type Object
     */
    @tracked querySchema = null;

    /**
     * What differs on this list when saving a search.
     *
     * @method savedSearchContext
     * @return {Object}
     */
    savedSearchContext() {
        return { relatedTo: 'workflow', messagePrefix: 'views.app.workflow.list.savedsearch' };
    }

    sort = 'Workflow.name';
    order = 'asc';

    /**
     * The columns of the list's `<AppUi::DataTable>`; the template's cell block draws them.
     *
     * @property columns
     * @type Array
     */
    get columns() {
        return [
            { key: 'workflow', label: this.intl.t('views.app.workflow.list.name'), sortable: true, sortKey: 'Workflow.name', class: 'workflow-cell' },
            { key: 'trigger', label: this.intl.t('views.app.workflow.list.trigger') },
            { key: 'scope', label: this.intl.t('views.app.workflow.list.scope') },
            { key: 'actors', label: this.intl.t('views.app.workflow.list.actors'), class: 'workflow-actors' },
            { key: 'runs', label: this.intl.t('views.app.workflow.list.runs') },
            { key: 'last-run', label: this.intl.t('views.app.workflow.list.lastRun') }
        ];
    }

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
        return (this.model ? this.model.slice() : []).map((workflow) => {
            let nodes = this.nodes.filter((node) => String(node.workflowId) === String(workflow.id));
            let runs = this.runs.filter((run) => String(run.workflowId) === String(workflow.id));

            return {
                id: workflow.id,
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

    /**
     * Activating a workflow sets it Active, deactivating sets it Disabled.
     *
     * @method activationTarget
     * @param {Prometheus.Models.Workflow} workflow
     * @param {Boolean} active
     * @return {Prometheus.Models.Workflow|null}
     * @protected
     */
    activationTarget(workflow, active) {
        let status = active ? 'Active' : 'Disabled';
        if (workflow.status === status) {
            return null;
        }
        workflow.set('status', status);
        return workflow;
    }
}
