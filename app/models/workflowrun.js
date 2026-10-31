/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * The workflowrun model: one run of a workflow, written by Gaia's engine. A test run (POST with test: true)
 * is not saved; its response carries the path and the steps as attributes.
 *
 * @class Workflowrun
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflowrunModel extends Model {
    /**
     * @property workflowId
     * @for Workflowrun
     * @public
     */
    @attr('string') workflowId;

    /**
     * @property workflowVersion
     * @for Workflowrun
     * @public
     */
    @attr('number') workflowVersion;

    /**
     * @property triggerNodeId
     * @for Workflowrun
     * @public
     */
    @attr('string') triggerNodeId;

    /**
     * @property status
     * @for Workflowrun
     * @public
     */
    @attr('string') status;

    /**
     * @property error
     * @for Workflowrun
     * @public
     */
    @attr('string') error;

    /**
     * @property entityType
     * @for Workflowrun
     * @public
     */
    @attr('string') entityType;

    /**
     * @property entityId
     * @for Workflowrun
     * @public
     */
    @attr('string') entityId;

    /**
     * The trigger payload; JSON text on a stored run, an object on a test run
     *
     * @property inputs
     * @for Workflowrun
     * @public
     */
    @attr() inputs;

    /**
     * Sent as true to ask for a test run
     *
     * @property test
     * @for Workflowrun
     * @public
     */
    @attr('boolean') test;

    /**
     * The attributes of a test run: the step results, in the order taken
     *
     * @property steps
     * @for Workflowrun
     * @public
     */
    @attr() steps;

    /**
     * @property startedAt
     * @for Workflowrun
     * @public
     */
    @attr('string') startedAt;

    /**
     * @property finishedAt
     * @for Workflowrun
     * @public
     */
    @attr('string') finishedAt;

    /**
     * @property dateCreated
     * @for Workflowrun
     * @public
     */
    @attr('string') dateCreated;
}
