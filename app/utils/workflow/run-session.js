/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import { tracked } from '@glimmer/tracking';
import RunTrace from 'prometheus/utils/workflow/run-trace';

/**
 * The state of the runs panels under the editor: the open panel, the listed runs and the run drawn on the
 * flow. A result that arrives after the panel was switched or closed is dropped.
 *
 * @class RunSession
 * @namespace Prometheus.Utils.Workflow
 */
export default class RunSession {
    /**
     * The open panel: 'runs', 'test' or null
     *
     * @property panel
     * @type String
     */
    @tracked panel = null;

    /**
     * @property runs
     * @type Array
     */
    @tracked runs = [];

    /**
     * The run (stored or simulated) whose path is drawn
     *
     * @property shownRun
     * @type Prometheus.Models.Workflowrun
     */
    @tracked shownRun = null;

    /**
     * @property runSteps
     * @type Array
     */
    @tracked runSteps = [];

    /**
     * @property isBusy
     * @type Boolean
     */
    @tracked isBusy = false;

    /**
     * @param {Object} options
     * @param {WorkflowRunsService} options.service
     * @param {Function} options.onFailure called with 'load' or 'test' and the error
     */
    constructor({ service, onFailure }) {
        this.service = service;
        this.onFailure = onFailure;
        this.token = 0;
    }

    /**
     * The path of the shown run, null when no run is shown
     *
     * @property trace
     * @type RunTrace
     */
    get trace() {
        return this.shownRun ? new RunTrace(this.runSteps) : null;
    }

    /**
     * Opens a panel (or closes it with null), clearing the drawn run and dropping answers still on the way
     *
     * @method open
     * @param {String} panel
     */
    open(panel) {
        this.token++;
        this.panel = panel;
        this.shownRun = null;
        this.runSteps = [];
        this.isBusy = false;
    }

    /**
     * @method close
     */
    close() {
        this.open(null);
    }

    /**
     * Opens the list of the workflow's runs
     *
     * @method showRuns
     * @param {String} workflowId
     */
    async showRuns(workflowId) {
        this.open('runs');
        let runs = await this._guard('load', () => this.service.loadRuns(workflowId));
        if (runs) {
            this.runs = runs;
        }
    }

    /**
     * Draws a stored run
     *
     * @method selectRun
     * @param {Prometheus.Models.Workflowrun} run
     */
    async selectRun(run) {
        let steps = await this._guard('load', () => this.service.loadSteps(run.id));
        if (steps) {
            this.runSteps = steps;
            this.shownRun = run;
        }
    }

    /**
     * Simulates the workflow for a record and draws the path
     *
     * @method testRun
     * @param {String} workflowId
     * @param {String} entityId
     */
    async testRun(workflowId, entityId) {
        let result = await this._guard('test', () => this.service.testRun(workflowId, entityId));
        if (result) {
            this.runSteps = result.steps;
            this.shownRun = result.run;
        }
    }

    /**
     * Runs a request and returns its result only while the panel it was started for is still open
     *
     * @method _guard
     * @param {String} kind
     * @param {Function} request
     * @return {Promise} the result, or undefined when it failed or went stale
     * @private
     */
    async _guard(kind, request) {
        let token = this.token;
        this.isBusy = true;
        try {
            let result = await request();
            return token === this.token ? result : undefined;
        } catch (error) {
            if (token === this.token) {
                this.onFailure(kind, error);
            }
            return undefined;
        } finally {
            if (token === this.token) {
                this.isBusy = false;
            }
        }
    }
}
