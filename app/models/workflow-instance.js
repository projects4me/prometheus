/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from "@ember-data/model";

/**
 * The workflow instance model
 *
 * @class WorkflowInstance
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module WorkflowInstance
 */
export default Model.extend({
    /**
     * The identifier of the workflow definition this instance is based on
     *
     * @property workflowDefinitionId
     * @type String
     * @for WorkflowInstance
     * @private
     */
    workflowDefinitionId: attr("string"),

    /**
     * Type of entity this workflow instance is associated with
     *
     * @property entityType
     * @type String
     * @for WorkflowInstance
     * @private
     */
    entityType: attr("string"),

    /**
     * The identifier of the entity this workflow instance is associated with
     *
     * @property entityId
     * @type String
     * @for WorkflowInstance
     * @private
     */
    entityId: attr("string"),

    /**
     * The identifier of the current node in the workflow
     *
     * @property currentNodeId
     * @type String
     * @for WorkflowInstance
     * @private
     */
    currentNodeId: attr("string"),

    /**
     * Status of the workflow instance
     *
     * @property status
     * @type String
     * @for WorkflowInstance
     * @private
     */
    status: attr("string"),

    /**
     * Date when the workflow instance was started
     *
     * @property startedAt
     * @type String
     * @for WorkflowInstance
     * @private
     */
    startedAt: attr("string"),

    /**
     * Date when the workflow instance was completed
     *
     * @property completedAt
     * @type String
     * @for WorkflowInstance
     * @private
     */
    completedAt: attr("string"),

    /**
     * JSON field for workflow variables
     *
     * @property variables
     * @type String
     * @for WorkflowInstance
     * @private
     */
    variables: attr("string"),

    /**
     * Date on which the workflow instance was created
     *
     * @property dateCreated
     * @type String
     * @for WorkflowInstance
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the workflow instance was last modified
     *
     * @property dateModified
     * @type String
     * @for WorkflowInstance
     * @private
     */
    dateModified: attr("string"),

    /**
     * The workflow definition this instance is based on
     *
     * @property workflowDefinition
     * @type WorkflowDefinitionModel
     * @for WorkflowInstance
     * @private
     */
    workflowDefinition: belongsTo("workflow-definition"),

    /**
     * The current node in the workflow
     *
     * @property currentNode
     * @type WorkflowNodeModel
     * @for WorkflowInstance
     * @private
     */
    currentNode: belongsTo("workflow-node", { inverse: null })
}); 