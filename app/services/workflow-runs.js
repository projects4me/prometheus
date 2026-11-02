/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Service, { inject as service } from '@ember/service';
import { normalizeSteps } from 'prometheus/utils/workflow/run-trace';

/**
 * The run history of a workflow and its test runs, read and written through the store
 *
 * @class WorkflowRunsService
 * @namespace Prometheus.Services
 * @extends Ember.Service
 */
export default class WorkflowRunsService extends Service {
    /**
     * @property store
     * @type Ember.Service
     * @public
     */
    @service store;

    /**
     * The latest runs of a workflow, newest first
     *
     * @method loadRuns
     * @param {String} workflowId
     * @return {Promise} resolves to an array of workflowrun records
     * @public
     */
    async loadRuns(workflowId) {
        let runs = await this.store.query('workflowrun', {
            query: `(Workflowrun.workflowId : ${workflowId})`,
            sort: 'Workflowrun.dateCreated',
            order: 'DESC',
            limit: 20
        });
        return runs.toArray();
    }

    /**
     * The steps of a stored run
     *
     * @method loadSteps
     * @param {String} runId
     * @return {Promise} resolves to the normalized steps
     * @public
     */
    async loadSteps(runId) {
        let steps = await this.store.query('workflowrunstep', {
            query: `(Workflowrunstep.runId : ${runId})`,
            sort: 'Workflowrunstep.sequence',
            order: 'ASC',
            limit: -1
        });
        return normalizeSteps(steps.toArray().map(step => step.getProperties(
            'sequence', 'nodeId', 'category', 'kind', 'status', 'port', 'inputs', 'outputs', 'error'
        )));
    }

    /**
     * Simulates a run of the workflow for a record; nothing is written. Gaia answers with the run, which is
     * not kept as a stored one.
     *
     * @method testRun
     * @param {String} workflowId
     * @param {String} entityId
     * @return {Promise} resolves to { run, steps }: the simulation's workflowrun record and its normalized steps
     * @public
     */
    async testRun(workflowId, entityId) {
        let run = this.store.createRecord('workflowrun', { workflowId, entityId, test: true });
        try {
            await run.save();
            return { run, steps: normalizeSteps(run.steps) };
        } catch (error) {
            run.unloadRecord();
            throw error;
        }
    }
}
