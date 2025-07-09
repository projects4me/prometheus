/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo } from "@ember-data/model";

/**
 * The workflow transition model
 *
 * @class WorkflowTransition
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module WorkflowTransition
 */
export default Model.extend({
    /**
     * The identifier of the workflow definition this transition belongs to
     *
     * @property workflowDefinitionId
     * @type String
     * @for WorkflowTransition
     * @private
     */
    workflowDefinitionId: attr("string"),

    /**
     * The identifier of the source node
     *
     * @property fromNodeId
     * @type String
     * @for WorkflowTransition
     * @private
     */
    fromNodeId: attr("string"),

    /**
     * The identifier of the target node
     *
     * @property toNodeId
     * @type String
     * @for WorkflowTransition
     * @private
     */
    toNodeId: attr("string"),

    /**
     * Name of the workflow transition
     *
     * @property name
     * @type String
     * @for WorkflowTransition
     * @private
     */
    name: attr("string"),

    /**
     * Description of the workflow transition
     *
     * @property description
     * @type String
     * @for WorkflowTransition
     * @private
     */
    description: attr("string"),

    /**
     * JSON conditions for transition rules
     *
     * @property conditions
     * @type String
     * @for WorkflowTransition
     * @private
     */
    conditions: attr("string"),

    /**
     * Date on which the workflow transition was created
     *
     * @property dateCreated
     * @type String
     * @for WorkflowTransition
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the workflow transition was last modified
     *
     * @property dateModified
     * @type String
     * @for WorkflowTransition
     * @private
     */
    dateModified: attr("string"),

    /**
     * The workflow definition this transition belongs to
     *
     * @property workflowDefinition
     * @type WorkflowDefinitionModel
     * @for WorkflowTransition
     * @private
     */
    workflowDefinition: belongsTo("workflow-definition"),

    /**
     * The source node of this transition
     *
     * @property fromNode
     * @type WorkflowNodeModel
     * @for WorkflowTransition
     * @private
     */
    fromNode: belongsTo("workflow-node", { inverse: null }),

    /**
     * The target node of this transition
     *
     * @property toNode
     * @type WorkflowNodeModel
     * @for WorkflowTransition
     * @private
     */
    toNode: belongsTo("workflow-node", { inverse: null })
}); 