/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* global Messenger */
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { bounds } from 'prometheus/utils/workflow/node-geometry';
import RunSession from 'prometheus/utils/workflow/run-session';

/**
 * The statuses of a workflow
 *
 * @property STATUSES
 * @type Array
 * @private
 */
const STATUSES = ['Draft', 'Active', 'Disabled'];

/**
 * The gap between a node added from the palette and the nodes above it
 *
 * @property ADD_GAP
 * @type Number
 * @private
 */
const ADD_GAP = 40;

/**
 * Escapes a server message before the toast renders it as HTML
 *
 * @method escapeHtml
 * @param {String} text
 * @return {String}
 * @private
 */
function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`);
}

/**
 * The workflow editor: the header fields, the graph edits the canvas and palette ask for, the selected node
 * and saving. The model is { workflow, graph, projects }.
 *
 * @class AppWorkflowPageController
 * @namespace Prometheus.Controllers
 * @extends Ember.Controller
 */
export default class AppWorkflowPageController extends Controller {
    /**
     * @property intl
     * @type Ember.Service
     * @public
     */
    @service intl;

    /**
     * @property breadcrumb
     * @type Ember.Service
     * @public
     */
    @service breadcrumb;

    /**
     * @property router
     * @type Ember.Service
     * @public
     */
    @service router;

    /**
     * @property workflowGraph
     * @type Ember.Service
     * @public
     */
    @service workflowGraph;

    /**
     * @property workflowRuns
     * @type Ember.Service
     * @public
     */
    @service workflowRuns;

    /**
     * The runs panels and the run drawn on the flow
     *
     * @property runSession
     * @type RunSession
     * @public
     */
    runSession = new RunSession({
        service: this.workflowRuns,
        onFailure: (kind, error) => this._postRunFailure(kind, error)
    });

    /**
     * The node shown in the properties box
     *
     * @property selectedNode
     * @type GraphNode
     * @public
     */
    @tracked selectedNode = null;

    /**
     * @property isSaving
     * @type Boolean
     * @public
     */
    @tracked isSaving = false;

    /**
     * @property statusOptions
     * @type Array
     * @public
     */
    get statusOptions() {
        return STATUSES.map(value => ({ value, label: this.intl.t(`views.app.workflow.status.${value}`) }));
    }

    /**
     * @property projectOptions
     * @type Array
     * @public
     */
    get projectOptions() {
        return (this.model?.projects ?? []).map(project => ({ value: String(project.id), label: project.name }));
    }

    /**
     * The project options the workflow is scoped to; none means every project
     *
     * @property selectedScope
     * @type Array
     * @public
     */
    get selectedScope() {
        let ids = this._scopeIds();
        return this.projectOptions.filter(option => ids.includes(option.value));
    }

    /**
     * Gaia keeps an Active workflow's graph read-only until it is saved as Draft or Disabled; its nodes can
     * still be moved. Gaia enforces the lock; this only hides the controls it would refuse.
     *
     * @property isGraphLocked
     * @type Boolean
     * @public
     */
    get isGraphLocked() {
        let workflow = this.model?.workflow;
        if (!workflow || workflow.isNew) {
            return false;
        }
        // read the tracked status and dirty flag first, so the lock updates when either changes
        let status = workflow.status;
        if (!workflow.hasDirtyAttributes) {
            return status === 'Active';
        }
        let savedStatus = workflow.changedAttributes().status?.[0] ?? status;
        return savedStatus === 'Active';
    }

    /**
     * The path of the shown run over the flow, null when no run is shown
     *
     * @property trace
     * @type RunTrace
     * @public
     */
    get trace() {
        return this.runSession.trace;
    }

    /**
     * Opens the list of the workflow's runs
     *
     * @method showRuns
     * @public
     */
    @action showRuns() {
        return this.runSession.showRuns(this.model.workflow.id);
    }

    /**
     * Opens the test run form
     *
     * @method showTestRun
     * @public
     */
    @action showTestRun() {
        this.runSession.open('test');
    }

    /**
     * Closes the open panel and the run drawn on the flow
     *
     * @method closePanel
     * @public
     */
    @action closePanel() {
        this.runSession.close();
    }

    /**
     * Draws a stored run on the flow with its steps
     *
     * @method selectRun
     * @param {Prometheus.Models.Workflowrun} run
     * @public
     */
    @action selectRun(run) {
        return this.runSession.selectRun(run);
    }

    /**
     * Simulates the workflow for a record and draws the path it takes
     *
     * @method runTest
     * @param {String} entityId
     * @public
     */
    @action runTest(entityId) {
        return this.runSession.testRun(this.model.workflow.id, entityId);
    }

    /**
     * @method changeStatus
     * @param {Object} option
     * @public
     */
    @action changeStatus(option) {
        this.model.workflow.status = option.value;
    }

    /**
     * @method changeScope
     * @param {Array} options
     * @public
     */
    @action changeScope(options) {
        this.model.workflow.scope = JSON.stringify(options.map(option => option.value));
    }

    /**
     * Adds a node of a kind at a canvas point, or under the other nodes when no point is given
     *
     * @method addNode
     * @param {String} category
     * @param {String} kind
     * @param {Object} point x and y
     * @public
     */
    @action addNode(category, kind, point = null) {
        if (this.isGraphLocked) {
            return;
        }
        let graph = this.model.graph;
        if (!point) {
            let box = bounds(graph.nodes);
            point = box ? { x: box.minX, y: box.maxY + ADD_GAP } : { x: ADD_GAP, y: ADD_GAP };
        }
        this.selectedNode = graph.addNode(category, kind, point.x, point.y);
    }

    /**
     * @method moveNode
     * @param {GraphNode} node
     * @param {Number} x
     * @param {Number} y
     * @public
     */
    @action moveNode(node, x, y) {
        this.model.graph.moveNode(node, x, y);
    }

    /**
     * @method selectNode
     * @param {GraphNode} node
     * @public
     */
    @action selectNode(node) {
        this.selectedNode = node;
    }

    /**
     * @method removeNode
     * @param {GraphNode} node
     * @public
     */
    @action removeNode(node) {
        if (this.isGraphLocked) {
            return;
        }
        this.model.graph.removeNode(node);
        if (this.selectedNode === node) {
            this.selectedNode = null;
        }
    }

    /**
     * @method connect
     * @param {GraphNode} from
     * @param {String} port
     * @param {GraphNode} to
     * @public
     */
    @action connect(from, port, to) {
        if (!this.isGraphLocked) {
            this.model.graph.connect(from, port, to);
        }
    }

    /**
     * @method removeEdge
     * @param {GraphEdge} edge
     * @public
     */
    @action removeEdge(edge) {
        if (!this.isGraphLocked) {
            this.model.graph.removeEdge(edge);
        }
    }

    /**
     * Saves the workflow and its graph through the workflow-graph service
     *
     * @method save
     * @public
     */
    @action async save() {
        let { workflow, graph } = this.model;
        if (this.isSaving) {
            return;
        }
        if (!String(workflow.name ?? '').trim()) {
            this._post(this.intl.t('views.app.workflow.editor.nameRequired'), 'error');
            return;
        }

        this.isSaving = true;
        try {
            let problems = await this.workflowGraph.saveWorkflow(workflow, graph);
            if (problems && workflow.status === 'Active' && workflow.hasDirtyAttributes) {
                this._post(this.intl.t('views.app.workflow.editor.notActivated', { count: problems }), 'error');
            } else if (problems) {
                this._post(this.intl.t('views.app.workflow.editor.savedWithProblems', { count: problems }), 'error');
            } else {
                this._post(this.intl.t('views.app.workflow.editor.saved'), 'success');
            }
            this.afterSave(workflow, problems);
        } catch (error) {
            this._post(this._errorMessage(error, this.intl.t('views.app.workflow.editor.saveFailed')), 'error');
        } finally {
            if (!this.isDestroying && !this.isDestroyed) {
                this.isSaving = false;
            }
        }
    }

    /**
     * Runs after a save; the editor of a new workflow moves to the saved workflow
     *
     * @method afterSave
     * @param {Prometheus.Models.Workflow} workflow
     * @param {Number} problems the steps and connections that could not be saved
     * @protected
     */
    afterSave(workflow) {
        this.breadcrumb.setTitle('app.workflow.page', workflow.name);
    }

    /**
     * The project ids in the workflow's scope
     *
     * @method _scopeIds
     * @return {Array}
     * @private
     */
    _scopeIds() {
        try {
            let ids = JSON.parse(this.model?.workflow?.scope || '[]');
            return Array.isArray(ids) ? ids.map(String) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Toasts a failed runs request
     *
     * @method _postRunFailure
     * @param {String} kind 'load' or 'test'
     * @param {Error} error
     * @private
     */
    _postRunFailure(kind, error) {
        if (kind === 'test') {
            this._post(this._errorMessage(error, this.intl.t('views.app.workflow.testRun.failed')), 'error');
        } else {
            this._post(this.intl.t('views.app.workflow.runs.loadFailed'), 'error');
        }
    }

    /**
     * The escaped messages of a Gaia error response, or the fallback when it has none
     *
     * @method _errorMessage
     * @param {Error} error
     * @param {String} fallback
     * @return {String}
     * @private
     */
    _errorMessage(error, fallback) {
        let messages = (Array.isArray(error?.errors) ? error.errors : []).map(entry => entry?.detail).filter(Boolean);
        return messages.length ? messages.map(escapeHtml).join('<br>') : fallback;
    }

    /**
     * @method _post
     * @param {String} message
     * @param {String} type
     * @private
     */
    _post(message, type) {
        new Messenger().post({ message, type, showCloseButton: true });
    }
}
