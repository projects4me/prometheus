/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

import Model, { attr, belongsTo, hasMany } from "@ember-data/model";

/**
 * The workflow node model
 *
 * @class WorkflowNode
 * @namespace Prometheus.Models
 * @extends DS.Model
 * @module WorkflowNode
 */
export default Model.extend({
    /**
     * The identifier of the workflow definition this node belongs to
     *
     * @property workflowDefinitionId
     * @type String
     * @for WorkflowNode
     * @private
     */
    workflowDefinitionId: attr("string"),

    /**
     * Unique identifier of the node within the workflow
     *
     * @property nodeId
     * @type String
     * @for WorkflowNode
     * @private
     */
    nodeId: attr("string"),

    /**
     * Type of the workflow node
     *
     * @property nodeType
     * @type String
     * @for WorkflowNode
     * @private
     */
    nodeType: attr("string"),

    /**
     * Name of the workflow node
     *
     * @property name
     * @type String
     * @for WorkflowNode
     * @private
     */
    name: attr("string"),

    /**
     * Description of the workflow node
     *
     * @property description
     * @type String
     * @for WorkflowNode
     * @private
     */
    description: attr("string"),

    /**
     * X position of the node in the workflow diagram
     *
     * @property positionX
     * @type Number
     * @for WorkflowNode
     * @private
     */
    positionX: attr("number"),

    /**
     * Y position of the node in the workflow diagram
     *
     * @property positionY
     * @type Number
     * @for WorkflowNode
     * @private
     */
    positionY: attr("number"),

    /**
     * JSON configuration for node-specific settings
     *
     * @property configuration
     * @type String
     * @for WorkflowNode
     * @private
     */
    configuration: attr("string"),

    /**
     * Date on which the workflow node was created
     *
     * @property dateCreated
     * @type String
     * @for WorkflowNode
     * @private
     */
    dateCreated: attr("string"),

    /**
     * Date on which the workflow node was last modified
     *
     * @property dateModified
     * @type String
     * @for WorkflowNode
     * @private
     */
    dateModified: attr("string"),

    /**
     * The workflow definition this node belongs to
     *
     * @property workflowDefinition
     * @type WorkflowDefinitionModel
     * @for WorkflowNode
     * @private
     */
    workflowDefinition: belongsTo("workflow-definition"),

    /**
     * The workflow rules associated with this node
     *
     * @property workflowRules
     * @type WorkflowRuleModel
     * @for WorkflowNode
     * @private
     */
    workflowRules: hasMany("workflow-rule")
}); 