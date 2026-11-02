/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflowrunstep model: one step of a stored workflow run, with its resolved inputs and outputs
 *
 * @class Workflowrunstep
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflowrunstepModel extends Model {
    /**
     * @property runId
     * @for Workflowrunstep
     * @public
     */
    @attr('string') runId;

    /**
     * @property nodeId
     * @for Workflowrunstep
     * @public
     */
    @attr('string') nodeId;

    /**
     * @property sequence
     * @for Workflowrunstep
     * @public
     */
    @attr('number') sequence;

    /**
     * @property category
     * @for Workflowrunstep
     * @public
     */
    @attr('string') category;

    /**
     * @property kind
     * @for Workflowrunstep
     * @public
     */
    @attr('string') kind;

    /**
     * @property status
     * @for Workflowrunstep
     * @public
     */
    @attr('string') status;

    /**
     * The output port the step went on by
     *
     * @property port
     * @for Workflowrunstep
     * @public
     */
    @attr('string') port;

    /**
     * @property inputs
     * @for Workflowrunstep
     * @public
     */
    @attr() inputs;

    /**
     * @property outputs
     * @for Workflowrunstep
     * @public
     */
    @attr() outputs;

    /**
     * @property error
     * @for Workflowrunstep
     * @public
     */
    @attr('string') error;

    /**
     * @property durationMs
     * @for Workflowrunstep
     * @public
     */
    @attr('number') durationMs;
}
