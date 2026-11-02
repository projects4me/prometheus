/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr } from '@ember-data/model';

/**
 * A row of the index Gaia keeps of the records a workflow node names (an agent in a filter or in a run agent
 * node, a user, ...), so the records can list the workflows that use them.
 *
 * @class Workflowreference
 * @namespace Prometheus.Models
 * @extends Model
 */
export default class WorkflowreferenceModel extends Model {
    /**
     * @property workflowId
     * @for Workflowreference
     * @public
     */
    @attr('string') workflowId;

    /**
     * @property nodeId
     * @for Workflowreference
     * @public
     */
    @attr('string') nodeId;

    /**
     * The model of the record, such as Agent
     *
     * @property entityType
     * @for Workflowreference
     * @public
     */
    @attr('string') entityType;

    /**
     * @property entityId
     * @for Workflowreference
     * @public
     */
    @attr('string') entityId;
}
